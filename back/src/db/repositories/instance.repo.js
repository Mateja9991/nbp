const { UserRepository } = require('./user.repo');
const { mainSession } = require('..');
const { BaseRepository } = require('./base.repo');

class RestaurantInstanceRepository extends UserRepository {
	async isInstancesOrder(instanceId, orderId) {
		return mainSession.runOne(
			`MATCH (i:RestaurantInstance)-[rel:INSTANCE_OF]->(r:Restaurant)<-[from:FROM]-(o:Order)
			WHERE ID(i) = ${this.stringify(instanceId)} 
			AND ID(o) = ${this.stringify(orderId)}
			RETURN o`
		);
	}
	async linkToRestaurant(restId, instanceId) {
		return mainSession.runOne(
			`MATCH (i:RestaurantInstance) WHERE ID (i) = ${this.stringify(instanceId)}
			 WITH i
			 MATCH (r:Restaurant) WHERE ID(r) = ${this.stringify(restId)}
			 MERGE (i)-[:INSTANCE_OF]->(r)
			 RETURN i`,
			{
				removeCacheKey: this.labels.reduce(
					(acc, label) => acc + `:${label}`,
					''
				),
			}
		);
	}
	async getInstanceOrders(instanceId, { limit = 4, skip = 0 } = {}) {
		return mainSession.run(
			`MATCH (cust:Customer)-[ordered:ORDERED]->(o:Order)<-[rel:MADE]-(i:RestaurantInstance)
			WHERE ID(i) = ${this.stringify(instanceId)} WITH cust, o, i
			MATCH (carr:Carrier)-[]->(o)
			WITH {
				id: ID(o),
				name: ID(o),
				price: o.price,
				deliveryPrice: o.deliveryPrice,
				customerName: cust.username,
				carrierName: carr.name
			} AS ord
			 RETURN ord
			 SKIP ${skip} LIMIT ${limit}`
		);
	}
	async getInstanceCurrentOrders(instanceId, { limit = 4, skip = 0 } = {}) {
		return mainSession.run(
			`MATCH (o:Order)<-[rel:MAKING]-(i:RestaurantInstance) WHERE ID(i) = ${this.stringify(
				instanceId
			)} AND (o)-[:DELIVERING]-()
			 RETURN o
			 SKIP ${skip} LIMIT ${limit}`
		);
	}
	async getInstancesRestaurant(instanceId) {
		return mainSession.runOne(
			`MATCH (i:RestaurantInstance) WHERE ID (i) = ${this.stringify(instanceId)}
			 WITH i
			 MATCH (r:Restaurant)<-[rel:INSTANCE_OF]-(i)
			 RETURN r`
		);
	}
}

module.exports = new RestaurantInstanceRepository(
	['User', 'RestaurantInstance'],
	{
		cache: true,
	}
);
