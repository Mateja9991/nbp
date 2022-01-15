const { geocode } = require('./utils');
const {
	UserRepositoryInstance: UserRepository,
	UserRepositoryInstance,
	RestaurantInstanceRepository,
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

async function registerInstance(req, res, next) {
	try {
		const { id: restId } = req.user;
		const { city, address } = req.body;
		const response = await geocode(`Serbia ${city} ${address}`);
		if (response.status == 200 && response.data) {
			const { data } = response;
			const { lat, lon } = data[0];
			const restInstance = await RestaurantInstanceRepository.register(
				req.body
			);
			await RestaurantInstanceRepository.linkToRestaurant(
				restId,
				restInstance.user.id
			);
			const { id } = restInstance.user;
			await redisAsync.geoAddAsync(`Restaurants:${city}`, lat, lon, id);
			await redisAsync.geoAddAsync(city, lat, lon, id);
			const redisRes = await redisAsync.geoPosAsync(`Restaurants:${city}`, id);
			restInstance.user.restId = restId;
			const instances = await RestaurantRepository.getAllInstances(restId);

			return res.json(instances);
		} else {
			return res.status(404).json({ error: 'Unable to locate' });
		}
	} catch (err) {
		next(err);
	}
}

async function getInstancePendingOrders(req, res, next) {
	try {
		const {
			user: { id: instanceId },
		} = req;
		const orders = await redisAsync.lrangeAsync(`${instanceId}:Orders`, 0, -1);

		let orderObjs = [];
		for (let orderId of orders) {
			orderObjs.push(await OrderRepository.getById(orderId));
		}
		return res.json(
			orderObjs.map((orders) => ({
				name: orders.id,
				...orders,
			}))
		);
	} catch (err) {
		next(err);
	}
}

async function getInstanceOrders(req, res, next) {
	try {
		const {
			user: { id: instanceId },
			query,
		} = req;
		const orders = await RestaurantInstanceRepository.getInstanceOrders(
			instanceId,
			query
		);

		return res.json(
			orders.map((orders) => ({
				name: orders.id,
				...orders,
			}))
		);
	} catch (err) {
		next(err);
	}
}

async function getInstanceCurrentOrders(req, res, next) {
	try {
		const {
			user: { id: instanceId },
			query,
		} = req;
		const orders = await RestaurantInstanceRepository.getInstanceCurrentOrders(
			instanceId,
			query
		);

		return res.json(
			orders.map((orders) => ({
				name: orders.id,
				...orders,
			}))
		);
	} catch (err) {
		next(err);
	}
}

async function getFoodFromInstanceMenu(req, res, next) {
	try {
		const {
			user: { id },
		} = req;
		const rest = await RestaurantInstanceRepository.getInstancesRestaurant(id);
		const foodList = await RestaurantRepository.getAllFoodFromMenu(rest.id);
		return res.json(foodList);
	} catch (err) {
		next(err);
	}
}
async function updateInstance(req, res, next) {
	try {
		const {
			params: { instanceId },
			body,
		} = req;
		const updatedInstance = await RestaurantInstanceRepository.update(
			instanceId,
			body
		);
		return res.json(updatedInstance);
	} catch (err) {
		next(err);
	}
}

async function deleteInstanceById(req, res, next) {
	try {
		const {
			params: { instanceId },
			user: { id: restId },
			body,
		} = req;
		const response = await RestaurantInstanceRepository.deleteById(instanceId);
		const instances = await RestaurantRepository.getAllInstances(restId);
		return res.json(instances);
	} catch (err) {
		next(err);
	}
}

module.exports = {
	registerInstance,
	getFoodFromInstanceMenu,
	getInstanceOrders,
	getInstanceCurrentOrders,
	getInstancePendingOrders,
	updateInstance,
	deleteInstanceById,
};
