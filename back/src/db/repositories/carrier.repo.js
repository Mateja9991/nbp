const jwt = require('jsonwebtoken');
const { mainSession } = require('..');
const { BaseRepository } = require('./base.repo');
const { hashString, hashCheck } = require('../../common/hashing');
const { UserRepository } = require('./user.repo');
const { USER_ROLES } = require('../../constants/user_roles');

class CarrierRepository extends UserRepository {
	async isCarriersDelivery(carrierId, deliveryId) {
		return mainSession.runOne(
			`MATCH (carr:Carrier)-[]->(o:Order)
			WHERE ID(carr) = ${this.stringify(carrierId)} 
			AND ID(o) = ${this.stringify(deliveryId)}
			RETURN o`
		);
	}
	async getCurrentDeliveries(carrierId, { skip = 0, limit = 4 } = {}) {
		return mainSession.run(
			`MATCH (c:Carrier)-[rel1:DELIVERING]->(o:Order)<-[fr:ORDERED]-(cust:Customer)
      WITH o, c, cust MATCH (o)-[]-(inst:RestaurantInstance)-[of:INSTANCE_OF]->(rest:Restaurant)
			WHERE ID(c) = ${this.stringify(carrierId)} 
			AND (o)<-[:MADE]-()
			WITH {
        id: ID(o),
        price: o.price,
        deliveryPrice: o.deliveryPrice,
		restaurant: rest.name,
        customerAddress: cust.address,
        restaurantAddress: inst.address
      } AS ords
      RETURN ords
	  SKIP ${skip} LIMIT ${limit}`
		);
	}
	async getDeliveredDeliveries(carrierId, { skip = 0, limit = 4 } = {}) {
		return mainSession.run(
			`MATCH (c:Carrier)-[rel1:DELIVERED]->(o:Order)<-[fr:ORDERED]-(cust:Customer)
			WITH o, c, cust 
			MATCH (o)-[]-(inst:RestaurantInstance)-[of:INSTANCE_OF]->(rest:Restaurant)
			WHERE ID(c) = ${this.stringify(carrierId)}
			WITH {
        id: ID(o),
        price: o.price,
        deliveryPrice: o.deliveryPrice,
		restaurant: rest.name,
        customerAddress: cust.address,
        restaurantAddress: inst.address
      } AS ords
      RETURN ords
	  SKIP ${skip} LIMIT ${limit}`
		);
	}
	async getDeliveries(carrierId, { skip = 0, limit = 4 } = {}) {
		return mainSession.run(
			`MATCH (c:Carrier)-[rel1]->(o:Order)<-[fr:ORDERED]-(cust:Customer)
			WITH o, c, cust 
			MATCH (o)-[]-(inst:RestaurantInstance)-[of:INSTANCE_OF]->(rest:Restaurant)
			WHERE ID(c) = ${this.stringify(carrierId)}
      WITH {
        id: ID(o),
        price: o.price,
        deliveryPrice: o.deliveryPrice,
		restaurant: rest.name,
        customerAddress: cust.address,
        restaurantAddress: inst.address
      } AS ords
      RETURN ords
	  SKIP ${skip} LIMIT ${limit}`
		);
	}
	async getCarrierContacts(carrierId) {
		return mainSession.run(
			`MATCH (c:Customer)-[rel:ORDERED]->(o:Order)<-[rel2:DELIVERING]-(carr:Carrier)
	  WHERE ID(carr) =  ${this.stringify(carrierId)}
	  RETURN DISTINCT c`
		);
	}
	//AND NOT EXISTS (o.delivered) OR NOT o.delivered=true
}

module.exports = new CarrierRepository(['User', 'Carrier'], {
	cache: true,
});
