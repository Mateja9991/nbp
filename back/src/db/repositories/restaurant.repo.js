const { mainSession } = require('..');
const { BaseRepository } = require('./base.repo');
const { hashString, hashCheck } = require('../../common/hashing');
const { UserRepository } = require('./user.repo');

class RestaurantRepository extends UserRepository {
	async addFoodToRestaurant(restaurantId, foodObj) {
		const food = await mainSession.runOne(
			`MATCH (r: Restaurant) WHERE ID(r) = ${restaurantId}
		CREATE (f: Food ${this.stringify(foodObj)})
		CREATE (r)-[r1: OFFERS]->(f) 
		return f`,
			{
				removeCacheKey: this.labels.reduce(
					(acc, label) => acc + `:${label}`,
					''
				),
			}
		);
		return food;
	}
	async getAllFoodFromMenu(
		restaurantId,
		{ limit = 5, skip = 0, sortBy, sortValue, ...match } = {}
	) {
		const foodArray = await mainSession.run(
			`MATCH(r: Restaurant) WHERE ID(r) = ${this.stringify(restaurantId)}
		MATCH( (r)-[:OFFERS]->(f:Food ${this.stringify(match)}))
		WITH f SKIP ${skip} LIMIT ${limit}
		RETURN f ORDER BY f.${sortBy ? sortBy : 'price'} ${
				sortValue ? sortValue : 'ASC'
			}
		 `
		);
		return foodArray;
	}
	async checkMenuForFood(foodId, restaurantId) {
		const item = await mainSession.runOne(
			`MATCH(r: Restaurant)-[rel:OFFERS]->(f:Food) WHERE ID(r) = ${restaurantId} AND ID(f) = ${foodId} RETURN f`,
			{ cacheKey: this.labels.reduce((acc, label) => acc + `:${label}`, '') }
		);
		return item;
	}
	async getReviews(restId, { limit = 4, skip = 0 } = {}) {
		return mainSession.run(
			`MATCH (r:Restaurant)-[rel:RATED]-(c:Customer) WHERE ID(r)=${this.stringify(
				restId
			)} WITH {
				customerName: c.username,
				rating: rel.rating,
				text: rel.text,
				createdAt: rel.createdAt
			} AS reviews
			RETURN reviews
			SKIP ${skip} LIMIT ${limit}`,

			{ cacheKey: this.labels.reduce((acc, label) => acc + `:${label}`, '') }
		);
	}
	async getRatedValue(restId) {
		return mainSession.runOne(
			`MATCH (r:Restaurant)-[rel:RATED]-(c:Customer) WHERE ID(r)=${this.stringify(
				restId
			)} RETURN avg(rel.rating)
			`,
			{ cacheKey: this.labels.reduce((acc, label) => acc + `:${label}`, '') }
		);
	}
	async getCustomersDeliveredOrders(restId, customerId) {
		return mainSession.run(
			`MATCH (c:Customer)-[ord:ORDERED]->(o:Order)-[fr:FROM]->(r:Restaurant) 
			 WHERE (o)-[:DELIVERED]-(:Carrier) 
			 AND ID(r) = ${this.stringify(restId)} AND ID(c) = ${this.stringify(customerId)}
			 RETURN ord`
		);
	}
	async getAvailableFoodTypes(restId) {
		return mainSession.run(
			`MATCH (r:Restaurant)-[rel:OFFERS]->(f:Food) WHERE ID(r)=${this.stringify(
				restId
			)} WITH DISTINCT f.type AS types
			RETURN types`,
			{ cacheKey: this.labels.reduce((acc, label) => acc + `:${label}`, '') }
		);
	}
	async rateRestaurant(restId, customerId, body) {
		const customersOrders = await this.getCustomersDeliveredOrders(
			restId,
			customerId
		);
		if (!customersOrders.length) return false;
		await mainSession.run(
			`MATCH (r:Restaurant)<-[rel:RATED]-(c:Customer) WHERE ID(r)=${this.stringify(
				restId
			)} AND ID(c) = ${this.stringify(customerId)}
				DELETE rel`,
			{
				removeCacheKey: this.labels.reduce(
					(acc, label) => acc + `:${label}`,
					''
				),
			}
		);
		return mainSession.runOne(
			`MATCH (r:Restaurant) WHERE ID(r) = ${this.stringify(restId)} 
			 WITH r 
			 MATCH (c:Customer) WHERE ID(c) = ${this.stringify(customerId)}
			 MERGE (r)<-[rel:RATED ${this.stringify({
					...body,
					createdAt: Date.now(),
				})}]-(c)
				WITH {
					customerName: c.username,
					rating: rel.rating,
					text: rel.text,
					createdAt: rel.createdAt
				} AS review
				RETURN review`,
			{
				removeCacheKey: this.labels.reduce(
					(acc, label) => acc + `:${label}`,
					''
				),
			}
		);
	}
	async getRestaurantOrders(restId, { limit = 4, skip = 0 } = {}) {
		return mainSession.run(
			`MATCH (cust:Customer)-[ordered:ORDERED]->(o:Order)-[rel:FROM]->(r:Restaurant)
			WHERE ID(r) = ${this.stringify(restId)}
			WITH {
				id: ID(o),
				name: ID(o),
				price: o.price,
				deliveryPrice: o.deliveryPrice,
				customerName: cust.username
			} AS ord
			 RETURN ord
			 SKIP ${skip} LIMIT ${limit}`
		);
	}
	async getAllInstances(restId, { limit = 4, skip = 0 } = {}) {
		return mainSession.run(
			`MATCH (i:RestaurantInstance)-[rel:INSTANCE_OF]->(r:Restaurant) WHERE ID(r) = ${this.stringify(
				restId
			)}
			 RETURN i
			 SKIP ${skip} LIMIT ${limit}`,
			{ cacheKey: this.labels.reduce((acc, label) => acc + `:${label}`, '') }
		);
	}
	async getPendingOrder(restId, userId) {
		return mainSession.runOne(
			`MATCH (c:Customer)-[rel1:ORDERED]->(o:Order)-[rel2:FROM]->(r:Restaurant) 
			WHERE ID(r) = ${this.stringify(restId)}  AND ID (c) = ${this.stringify(userId)}
			AND NOT (o)<-[:DELIVERING]-() AND NOT (o)<-[:DELIVERED]-()
			 RETURN o`
		);
	}
}

module.exports = new RestaurantRepository(['User', 'Restaurant'], {
	searchTermProp: 'name',
	cache: true,
});
