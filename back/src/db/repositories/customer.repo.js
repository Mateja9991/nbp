const jwt = require('jsonwebtoken');
const { mainSession } = require('..');
const { BaseRepository } = require('./base.repo');
const { hashString, hashCheck } = require('../../common/hashing');
const { UserRepository } = require('./user.repo');
const { USER_ROLES } = require('../../constants/user_roles');

class CustomerRepository extends UserRepository {
	async isCustomersOrder(customerId, orderId) {
		return mainSession.runOne(
			`MATCH (cust:Customer)-[ordered:ORDERED]->(o:Order)
			WHERE ID(cust) = ${this.stringify(customerId)} 
			AND ID(o) = ${this.stringify(orderId)}
			RETURN o`
		);
	}
	async getCustomerOrders(customerId, { limit = 4, skip = 0 } = {}) {
		return mainSession.run(
			`MATCH (cust:Customer)-[ordered:ORDERED]->(o:Order)-[rel:FROM]->(r:Restaurant)
			WHERE ID(cust) = ${this.stringify(customerId)} 
			WITH {
				id: ID(o),
				name: ID(o),
				price: o.price,
				deliveryPrice: o.deliveryPrice,
		        from: r.name
			} AS ord
			 RETURN ord
			 SKIP ${skip} LIMIT ${limit}`
		);
	}
	async getCustomerDeliveredOrders(customerId, { limit = 4, skip = 0 } = {}) {
		return mainSession.run(
			`MATCH (cust:Customer)-[ordered:ORDERED]->(o:Order)-[rel:FROM]->(r:Restaurant)
			WHERE ID(cust) = ${this.stringify(customerId)} WITH cust, o, r
			MATCH (carr:Carrier)-[:DELIVERED]->(o)
			WITH {
				id: ID(o),
				name: ID(o),
				price: o.price,
				deliveryPrice: o.deliveryPrice,
        from: r.name,
				carrierName: carr.name
			} AS ord
			 RETURN ord
			 SKIP ${skip} LIMIT ${limit}`
		);
	}
	async getCustomerCurrentDeliveries(customerId, { skip = 0, limit = 4 } = {}) {
		console.log(limit, skip);
		return mainSession.run(
			`MATCH (cust:Customer)-[ordered:ORDERED]->(o:Order)-[rel:FROM]->(r:Restaurant)
			WHERE ID(cust) = ${this.stringify(customerId)} WITH cust, o, r
			MATCH (carr:Carrier)-[:DELIVERING]->(o)
			WITH {
				id: ID(o),
				name: ID(o),
				price: o.price,
				deliveryPrice: o.deliveryPrice,
        from: r.name,
				carrierName: carr.name
			} AS ord
			 RETURN ord
			 SKIP ${skip} LIMIT ${limit}`
		);
	}
	async getCustomerContacts(customerId) {
		return mainSession.run(
			`MATCH (c:Carrier)-[rel:DELIVERING]->(o:Order)<-[rel2:ORDERED]-(cust:Customer) 
		WHERE ID(cust) =  ${this.stringify(customerId)}
		RETURN DISTINCT c`
		);
	}
}

module.exports = new CustomerRepository(['User', 'Customer'], {});
