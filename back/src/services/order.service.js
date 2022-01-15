const {
	OrderRepository,
	RestaurantRepository,
	FoodRepository,
} = require('../db/repositories');
const { redis, redisAsync } = require('../db');

const Socket = require('../socket/socket');
const { SOCKET_EVENTS } = require('../constants');
const { orderToUserAuth } = require('../middleware/auth');
async function createOrder(req, res, next) {
	try {
		const {
			params: { restId },
			user: { id: userId },
			body,
		} = req;
		const order = await OrderRepository.create(restId, userId, body);
		res.json(order);
	} catch (err) {
		next(err);
	}
}
async function getOrderById(req, res, next) {
	try {
		const {
			params: { orderId },
		} = req;
		const order = await OrderRepository.getById(orderId);
		res.json(order);
	} catch (err) {
		next(err);
	}
}
async function getOrdersRestaurant(req, res, next) {
	try {
		const {
			params: { orderId },
		} = req;
		const restaurant = await OrderRepository.getOrdersRestaurant(orderId);
		res.json(restaurant);
	} catch (err) {
		next(err);
	}
}

async function getOrdersInstance(req, res, next) {
	try {
		// const {
		// 	params: { restId },
		// 	body,
		// } = req;
		// const order = await OrderRepository.getRestaurantOrders(restId, userId, body);
		const {
			params: { orderId },
		} = req;
		const instance = await OrderRepository.getOrdersInstance(orderId);
		res.json(instance);
	} catch (err) {
		next(err);
	}
}

async function updateOrder(req, res, next) {
	try {
		const {
			params: { orderId },
			body: { foodIds, ...body },
			foods,
			order,
		} = req;
		const len = order.foodIds.length;
		const updatedOrder = await OrderRepository.update(orderId, {
			...body,
			foodIds: foodIds.filter((foodId) => !order.foodIds.includes(foodId)),
			price: foods.reduce((acc, { price }) => acc + price, 0),
		});
		res.json(updatedOrder);
	} catch (err) {
		next(err);
	}
}

async function markAsMade(req, res, next) {
	try {
		let {
			params: { orderId },
			user: { id: instanceId },
		} = req;
		if (!orderId) orderId = req.orderId;
		await OrderRepository.madeByInstance(orderId, instanceId);
		res.json(orderId);
	} catch (err) {
		next(err);
	}
}

async function addFoodToOrder(req, res, next) {
	try {
		const {
			body: { foodIds },
			foods,
			order,
		} = req;
		let {
			params: { orderId },
		} = req;
		if (!orderId) orderId = req.orderId;
		for (let foodId of foodIds) {
			const result = await OrderRepository.addFood(orderId, foodId);
		}
		const newFood = await OrderRepository.getFoodFromOrder(orderId);
		const updatedOrder = await OrderRepository.update(orderId, {
			price: newFood.reduce((acc, { food: { price } }) => acc + price, 0),
		});
		res.json(newFood);
	} catch (err) {
		next(err);
	}
}

async function deleteFoodFromOrder(req, res, next) {
	try {
		const {
			params: { orderId },
			body: { foodIds },
			foods,
			order,
		} = req;
		for (let foodId of foodIds) {
			const result = await OrderRepository.deleteFood(orderId, foodId);
		}
		const newFood = await OrderRepository.getFoodFromOrder(orderId);
		const updatedOrder = await OrderRepository.update(orderId, {
			price: newFood.reduce((acc, { food: { price } }) => acc + price, 0),
		});
		res.json(newFood);
	} catch (err) {
		next(err);
	}
}

async function deleteFoodRelationFromOrder(req, res, next) {
	try {
		const {
			params: { orderId },
			order,
		} = req;
		let {
			body: { relIds },
		} = req;
		if (!(relIds instanceof Array)) relIds = [relIds];
		for (let relId of relIds) {
			const result = await OrderRepository.deleteFood(
				orderId,
				relId.toString()
			);
		}
		const newFood = await OrderRepository.getFoodFromOrder(orderId);
		const updatedOrder = await OrderRepository.update(orderId, {
			price: newFood.reduce((acc, { food: { price } }) => acc + price, 0),
		});
		res.json(newFood);
	} catch (err) {
		next(err);
	}
}

async function confirmOrder(req, res, next) {
	try {
		const {
			user: { city, id: userId },
			params: { orderId },
		} = req;
		const { id: restId } = await OrderRepository.getOrdersRestaurant(orderId);
		let instanceIds = await RestaurantRepository.getAllInstances(restId);
		instanceIds = instanceIds.filter((inst) => inst.city == city);
		const instDist = await Promise.all(
			instanceIds.map(async ({ id: instId }) => {
				const instPos = parseInt(await redisAsync.geoPosAsync(city, instId));
				return {
					lat: instPos[0],
					lon: instPos[1],
					dist: parseInt(
						await redisAsync.geoDistAsync(city, userId, instId, 'm')
					),
					id: instId,
				};
			})
		);
		instDist.sort((a, b) => a.dist - b.dist);
		let i;
		for (
			i = 0;
			i < instDist.length - 1;
			await redisAsync.setAsync(`${orderId}${instDist[i++].id}`, instDist[i].id)
		)
			await redisAsync.setAsync(`${orderId}${instDist[i].id}`, null);
		// Socket.sendEventToRoom(instDist[0].id, SOCKET_EVENTS.NEW_ORDER, {
		// 	orderId,
		// });
		Socket.sendEventToRoom(restId, SOCKET_EVENTS.NEW_ORDER, {
			instanceId: instDist[0].id,
			orderId,
		});
		res.json({ status: 'Request sent.' });
	} catch (err) {
		next(err);
	}
}
async function deleteOrder(req, res, next) {
	try {
		const {
			params: { orderId },
		} = req;
		const order = await OrderRepository.deleteById(orderId);
		res.json(order);
	} catch (err) {
		next(err);
	}
}

async function getFoodFromOrder(req, res, next) {
	try {
		const {
			params: { orderId },
		} = req;
		const foods = await OrderRepository.getFoodFromOrder(orderId);
		res.json(foods);
	} catch (err) {
		next(err);
	}
}

async function getPendingOrder(req, res, next) {
	try {
		const {
			params: { restId },
			user: { id: userId },
		} = req;
		const order = await RestaurantRepository.getPendingOrder(restId, userId);
		return res.json(order);
	} catch (err) {
		next(err);
	}
}
async function markAsDelivered(req, res, next) {
	try {
		const {
			user: { id: carrierId },
			params: { orderId },
		} = req;
		const customer = await OrderRepository.getCustomer(orderId);
		await redisAsync.lremAsync(
			`${carrierId}:Customers`,
			0,
			customer.id.toString()
		);
		const order = await OrderRepository.markAsDelivered(carrierId, orderId);
		return res.json(order);
	} catch (err) {
		next(err);
	}
}

module.exports = {
	createOrder,
	getOrderById,
	getOrdersRestaurant,
	getOrdersInstance,
	markAsMade,
	updateOrder,
	confirmOrder,
	deleteOrder,
	addFoodToOrder,
	deleteFoodFromOrder,
	deleteFoodRelationFromOrder,
	getFoodFromOrder,
	getPendingOrder,
	markAsDelivered,
};
