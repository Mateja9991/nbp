const { destructureObject, geocode } = require('./utils');
const {
	UserRepositoryInstance: UserRepository,
	CarrierRepository,
	OrderRepository,
	RestaurantInstanceRepository,
} = require('../db/repositories');
const { redis, redisAsync } = require('../db');
const { jwtAuthMiddleware } = require('../middleware/auth');

async function registerCarrier(req, res, next) {
	try {
		const { city, address } = req.body;
		const response = await geocode(`Serbia ${city} ${address}`);
		if (response.status == 200 && response.data) {
			const { data } = response;
			const { lat, lon } = data[0];
			const payload = await CarrierRepository.register(req.body);
			const {
				user: { id },
			} = payload;
			await redisAsync.geoAddAsync(`Carriers:${city}`, lat, lon, id);
			await redisAsync.geoAddAsync(city, lat, lon, id);
			const redisRes = await redisAsync.geoPosAsync(`Carriers:${city}`, id);

			return res.json(payload);
		} else {
			return res.status(404).send({ error: 'Unable to locate' });
		}
	} catch (err) {
		next(err);
	}
}

async function getPendingDeliveries(req, res, next) {
	try {
		const {
			user: { id: carrierId },
		} = req;
		const deliveries = await redisAsync.lrangeAsync(
			`${carrierId}:Deliveries`,
			0,
			-1
		);

		let deliveryObjs = [];
		for (let orderId of deliveries) {
			let delivery = await OrderRepository.getById(orderId);
			delivery.name = delivery.id;
			delivery.customerAddress = (
				await OrderRepository.getCustomer(orderId)
			).address;
			const instance = await OrderRepository.getOrdersInstance(orderId);
			delivery.restaurantAddress = instance.address;
			delivery.restaurant =
				await RestaurantInstanceRepository.getInstancesRestaurant(instance.id)
					.name;
			deliveryObjs.push(delivery);
		}
		return res.json(deliveryObjs);
	} catch (err) {
		next(err);
	}
}

async function getDeliveredDeliveries(req, res, next) {
	try {
		const {
			user: { id: carrierId },
			query,
		} = req;
		const deliveries = await CarrierRepository.getDeliveredDeliveries(
			carrierId,
			query
		);
		return res.json(
			deliveries.map((delivery) => ({
				name: delivery.id,
				...delivery,
			}))
		);
	} catch (err) {
		next(err);
	}
}
async function getCurrentDeliveries(req, res, next) {
	try {
		const {
			user: { id: carrierId },
			query,
		} = req;
		const deliveries = await CarrierRepository.getCurrentDeliveries(
			carrierId,
			query
		);

		return res.json(
			deliveries.map((delivery) => ({
				name: delivery.id,
				...delivery,
			}))
		);
	} catch (err) {
		next(err);
	}
}
async function getAllCarriers(req, res, next) {
	try {
		const { data: carriers } = await CarrierRepository.getAll(req.query);
		return res.json(carriers);
	} catch (err) {
		next(err);
	}
}

async function getCarrierContacts(req, res, next) {
	try {
		const {
			user: { id: carrierId },
		} = req;
		let carriers = await CarrierRepository.getCarrierContacts(carrierId);
		return res.json(carriers);
	} catch (err) {
		next(err);
	}
}

module.exports = {
	getPendingDeliveries,
	getCurrentDeliveries,
	getDeliveredDeliveries,
	registerCarrier,
	getAllCarriers,
	getCarrierContacts,
};
