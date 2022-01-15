const { mainSession } = require('..');
const { BaseRepository } = require('./base.repo');
const { hashString, hashCheck } = require('../../common/hashing');
class OrderRepository extends BaseRepository {
	async create(restId, userId, body = {}) {
		return mainSession.runOne(
			`CREATE (o:Order ${this.stringify(body)})
		     WITH o
			 MATCH (c:Customer) WHERE ID(c) = ${this.stringify(userId)}
             MATCH (r:Restaurant) WHERE ID(r) = ${this.stringify(restId)}
			 MERGE (o)-[:FROM]->(r)
			 MERGE (c)-[:ORDERED]->(o)
			 RETURN o`,
			{
				removeCacheKey: this.labels.reduce(
					(acc, label) => acc + `:${label}`,
					''
				),
			}
		);
	}
	async getOrdersRestaurant(orderId) {
		return mainSession.runOne(
			`MATCH (o:Order)-[rel:FROM]->(r:Restaurant) WHERE ID(o) = ${this.stringify(
				orderId
			)}
			 RETURN r`,
			{ cacheKey: this.labels.reduce((acc, label) => acc + `:${label}`, '') }
		);
	}
	async getOrdersInstance(orderId) {
		return mainSession.runOne(
			`MATCH (o:Order)-[]-(i:RestaurantInstance) WHERE ID(o) = ${this.stringify(
				orderId
			)} RETURN i`,
			{ cacheKey: this.labels.reduce((acc, label) => acc + `:${label}`, '') }
		);
	}
	async beingMadeByInstace(orderId, instanceId) {
		return mainSession.runOne(
			`MATCH (o:Order) WHERE ID (o) = ${this.stringify(orderId)}
			 WITH o
			 MATCH (i:RestaurantInstance) WHERE ID(i) = ${this.stringify(instanceId)}
			 MERGE (o)<-[rel:MAKING]-(i)
			 RETURN o`,
			{
				removeCacheKey: this.labels.reduce(
					(acc, label) => acc + `:${label}`,
					''
				),
			}
		);
	}
	async madeByInstance(orderId, instanceId) {
		await this.unlinkFromInstance(orderId, instanceId);
		return mainSession.runOne(
			`MATCH (o:Order) WHERE ID (o) = ${this.stringify(orderId)}
			 WITH o
			 MATCH (i:RestaurantInstance) WHERE ID(i) = ${this.stringify(instanceId)}
			 MERGE (o)<-[rel:MADE]-(i)
			 RETURN o`,
			{
				removeCacheKey: this.labels.reduce(
					(acc, label) => acc + `:${label}`,
					''
				),
			}
		);
	}
	async unlinkFromInstance(orderId, instanceId) {
		return mainSession.run(
			`MATCH (o:Order) WHERE ID (o) = ${this.stringify(orderId)}
			 WITH o
			 MATCH (o)<-[rel]-(i:RestaurantInstance) WHERE ID(i) = ${this.stringify(
					instanceId
				)}
			 DELETE rel`,
			{
				removeCacheKey: this.labels.reduce(
					(acc, label) => acc + `:${label}`,
					''
				),
			}
		);
	}
	async getDeliveringOrders(customerId) {
		return mainSession.run(
			`MATCH ()-[:DELIVERING]-(o:Order)-[rel:ORDERED]-(c:Customer) 
			WHERE ID (c)= ${this.stringify(customerId)}
			 RETURN o`,
			{ cacheKey: this.labels.reduce((acc, label) => acc + `:${label}`, '') }
		);
	}

	async linkToInstancePending(orderId, instanceId) {
		return mainSession.runOne(
			`MATCH (o:Order) WHERE ID (o) = ${this.stringify(orderId)}
			 WITH o
			 MATCH (i:RestaurantInstance) WHERE ID(i) = ${this.stringify(instanceId)}
			 MERGE (o)-[rel:PENDING]->(i)
			 RETURN o`,
			{
				removeCacheKey: this.labels.reduce(
					(acc, label) => acc + `:${label}`,
					''
				),
			}
		);
	}
	async unlinkToInstancePending(orderId, instanceId) {
		return mainSession.runOne(
			`MATCH (o:Order) WHERE ID (o) = ${this.stringify(orderId)}
			 WITH o
			 MATCH (o)-[rel:PENDING]->(i:RestaurantInstance) WHERE ID(i) = ${this.stringify(
					instanceId
				)}
			 DELETE rel`
		);
	}
	async getFoodFromOrder(orderId) {
		return mainSession.run(
			`MATCH (o:Order)-[rel:CONTAINS]->(food:Food) WHERE ID (o) = ${this.stringify(
				orderId
			)}
			 RETURN food, rel`
		);
	}
	async addFood(orderId, foodId) {
		return mainSession.runOne(
			`MATCH (o:Order) WHERE ID (o) = ${this.stringify(orderId)}
			 WITH o
			 MATCH (f:Food) WHERE ID(f) = ${this.stringify(foodId)}
			 MERGE (o)-[rel:CONTAINS { date: ${Date.now()}}]->(f)
			 RETURN o`,
			{
				removeCacheKey: this.labels.reduce(
					(acc, label) => acc + `:${label}`,
					''
				),
			}
		);
	}
	async deleteFood(orderId, relId) {
		return mainSession.runOne(
			`MATCH (o:Order)-[rel:CONTAINS]->(f:Food) WHERE ID (o) = ${this.stringify(
				orderId
			)} AND
			 ID (rel) = ${this.stringify(relId)} 
			 DELETE rel
			 RETURN o`,
			{
				removeCacheKey: this.labels.reduce(
					(acc, label) => acc + `:${label}`,
					''
				),
			}
		);
	}
	async getCarrier(orderId) {
		return mainSession.runOne(
			`MATCH (o:Order)<-[rel]-(c:Carrier) WHERE ID(o) = ${this.stringify(
				orderId
			)}
			 RETURN c`
		);
	}
	// async getInstance() {}
	async getCustomer(orderId) {
		return mainSession.runOne(
			`MATCH (o:Order)<-[rel:ORDERED]-(c:Customer) WHERE ID(o) = ${this.stringify(
				orderId
			)}
			 RETURN c`
		);
	}
	async markAsDelivering(carrierId, orderId) {
		return mainSession.runOne(
			`MATCH (c:Carrier)
			WHERE ID(c) = ${this.stringify(carrierId)}
			WITH c
			MATCH (o:Order) WHERE ID(o) = ${this.stringify(orderId)}
			MERGE (c)-[rel:DELIVERING { date: ${Date.now()} }]->(o)
			 RETURN o`,
			{
				removeCacheKey: this.labels.reduce(
					(acc, label) => acc + `:${label}`,
					''
				),
			}
		);
	}
	async markAsDelivered(carrierId, orderId) {
		mainSession.runOne(
			`MATCH (c:Carrier)-[rel:DELIVERING]->(o:Order) WHERE ID(c) = ${this.stringify(
				carrierId
			)} AND ID(o) = ${this.stringify(orderId)} DELETE rel`
		);
		return mainSession.runOne(
			`MATCH (c:Carrier)
			WHERE ID(c) = ${this.stringify(carrierId)}
			WITH c
			MATCH (o:Order) WHERE ID(o) = ${this.stringify(orderId)}
			MERGE (c)-[rel:DELIVERED { date: ${Date.now()} }]->(o)
			 RETURN o`,
			{
				removeCacheKey: this.labels.reduce(
					(acc, label) => acc + `:${label}`,
					''
				),
			}
		);
	}
}

module.exports = new OrderRepository(['Order'], {
	cache: true,
});
