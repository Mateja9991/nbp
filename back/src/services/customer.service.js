const { destructureObject } = require('./utils');
const { geocode } = require('./utils');
const {
	UserRepositoryInstance: UserRepository,
	CustomerRepository,
	RestaurantRepository,
	OrderRepository,
} = require('../db/repositories');
const {
	cacheClient,
	cacheClientAsync,
	redisPub,
	redisPubAsync,
	redisSub,
	redisSubAsync,
	redis,
	redisAsync,
} = require('../db');

async function registerCustomer(req, res, next) {
	try {
		const { city, address } = req.body;
		const response = await geocode(`Serbia ${city} ${address}`);

		if (response.status == 200 && response.data) {
			const { data } = response;
			const { lat, lon } = data[0];
			const payload = await CustomerRepository.register(req.body);
			const {
				user: { id },
			} = payload;
			await redisAsync.geoAddAsync(`Customers:${city}`, lat, lon, id);

			await redisAsync.geoAddAsync(city, lat, lon, id);
			const redisRes = await redisAsync.geoPosAsync(`Customers:${city}`, id);
			return res.json(payload);
		} else {
			return res.status(404).send({ error: 'Unable to locate' });
		}
	} catch (err) {
		next(err);
	}
}

async function getCustomersDeliveredOrders(req, res, next) {
	try {
		const {
			user: { id: customerId },
			query,
		} = req;
		console.log(query);
		const deliveredOrders = await CustomerRepository.getCustomerDeliveredOrders(
			customerId,
			query
		);

		return res.json(deliveredOrders);
	} catch (err) {
		next(err);
	}
}

async function getCustomersCurrentDeliveries(req, res, next) {
	try {
		const {
			user: { id: customerId },
			query,
		} = req;
		const deliveries = await CustomerRepository.getCustomerCurrentDeliveries(
			customerId,
			query
		);
		console.log(deliveries, query);
		return res.json(deliveries);
	} catch (err) {
		next(err);
	}
}

async function getAllCustomers(req, res, next) {
	try {
		const { data: customers } = await CustomerRepository.getAll(req.query);
		return res.json(customers);
	} catch (err) {
		next(err);
	}
}

async function getCustomerContacts(req, res, next) {
	try {
		const {
			user: { id: customerId },
		} = req;
		let carriers = await CustomerRepository.getCustomerContacts(customerId);
		return res.json(carriers);
	} catch (err) {
		next(err);
	}
}

module.exports = {
	registerCustomer,
	getAllCustomers,
	getCustomersDeliveredOrders,
	getCustomersCurrentDeliveries,
	getCustomerContacts,
};
