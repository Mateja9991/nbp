const { destructureObject } = require('./utils');
const { geocode } = require('./utils');
const {
	UserRepositoryInstance: UserRepository,
	RestaurantRepository,
	UserRepositoryInstance,
	FoodRepository,
	RestaurantInstanceRepository,
} = require('../db/repositories');
const Socket = require('../socket/socket');
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

async function registerRestaurant(req, res, next) {
	try {
		const payload = await RestaurantRepository.register(req.body);
		return res.json(payload);
	} catch (err) {
		next(err);
	}
}

async function getAllRestaurants(req, res, next) {
	try {
		let { data: restaurants } = await RestaurantRepository.getAll(req.query);
		restaurants = await Promise.all(
			restaurants.map(async (rest) => {
				rest.rated = await RestaurantRepository.getRatedValue(rest.id);
				return rest;
			})
		);
		return res.json(restaurants);
	} catch (err) {
		next(err);
	}
}

async function addFoodToRestaurant(req, res, next) {
	try {
		const {
			user: { id },
			body,
		} = req;
		const food = await RestaurantRepository.addFoodToRestaurant(id, body);
		if (!food) return res.status(404).json({ message: 'Failed adding food' });
		const foods = await RestaurantRepository.getAllFoodFromMenu(id);
		return res.json(foods);
	} catch (err) {
		next(err);
	}
}

async function getRestaurantReviews(req, res, next) {
	try {
		const {
			user: { id },
			params: { restaurantId },
			query,
		} = req;
		let reviews = await RestaurantRepository.getReviews(restaurantId, query);

		res.json(reviews);
	} catch (err) {
		next(err);
	}
}

async function getRestaurantOrders(req, res, next) {
	try {
		const {
			user: { id: restId },
			query,
		} = req;
		console.log(query);
		const orders = await RestaurantRepository.getRestaurantOrders(
			restId,
			query
		);
		res.json(orders);
	} catch (err) {
		next(err);
	}
}

async function getAllRestaurantInstances(req, res, next) {
	try {
		const {
			user: { id },
			query,
		} = req;
		const restInstances = (
			await RestaurantRepository.getAllInstances(id, query)
		).map(({ password, ...filtered }) => filtered);
		return res.json(restInstances);
	} catch (err) {
		next(err);
	}
}

async function getAvailableFoodTypes(req, res, next) {
	try {
		const {
			params: { restaurantId },
		} = req;
		res.json(await RestaurantRepository.getAvailableFoodTypes(restaurantId));
	} catch (err) {
		next(err);
	}
}

async function searchRestaurantsByName(req, res, next) {
	try {
		const {
			params: { name },
			query,
		} = req;
		const { data: matchedRestaurants } = await RestaurantRepository.getAll({
			...query,
			searchTerm: name,
		});

		return res.json(matchedRestaurants);
	} catch (err) {
		next(err);
	}
}

async function getFoodFromMenu(req, res, next) {
	try {
		const {
			params: { restaurantId },
			query,
		} = req;
		const foodArray = await RestaurantRepository.getAllFoodFromMenu(
			restaurantId,
			query
		);

		return res.json(foodArray);
	} catch (err) {
		next(err);
	}
}

async function getFoodById(req, res, next) {
	try {
		const {
			params: { foodId },
		} = req;
		const food = await FoodRepository.getById(foodId);
		return res.json(food);
	} catch (err) {
		next(err);
	}
}

async function rateRestaurant(req, res, next) {
	try {
		const {
			user: { id: customerId },
			body,
			params: { restId },
		} = req;

		if (body.rating) body.rating = parseInt(body.rating);
		const newReview = await RestaurantRepository.rateRestaurant(
			restId,
			customerId,
			body
		);
		const reviews = await RestaurantRepository.getReviews(restId);
		if (!newReview) {
			throw new Error('You must order from restaurant in order to rate it.');
		}

		return res.json(newReview);
	} catch (err) {
		next(err);
	}
}

async function updateRestaurant(req, res, next) {
	try {
		const {
			user: { id: restId },
			body,
		} = req;

		let updatedRestaurant = req.user;
		if (body)
			updatedRestaurant = await RestaurantRepository.update(restId, body);
		updatedRestaurant.rated = await RestaurantRepository.getRatedValue(
			updatedRestaurant.id
		);
		return res.json(updatedRestaurant);
	} catch (err) {
		next(err);
	}
}

async function updateFood(req, res, next) {
	try {
		const {
			params: { foodId },
			body,
		} = req;
		console.log(req.file);
		const updatedFood = await FoodRepository.update(foodId, body);
		return res.json(updatedFood);
	} catch (err) {
		next(err);
	}
}

async function deleteFoodById(req, res, next) {
	try {
		const {
			params: { foodId },
			user: { id: restId },
		} = req;
		await FoodRepository.deleteById(foodId);
		const foods = await RestaurantRepository.getAllFoodFromMenu(restId);
		return res.json(foods);
	} catch (err) {
		next(err);
	}
}

module.exports = {
	registerRestaurant,
	getAllRestaurants,
	getAllRestaurantInstances,
	getRestaurantReviews,
	getRestaurantOrders,
	addFoodToRestaurant,
	getFoodFromMenu,
	getAvailableFoodTypes,
	searchRestaurantsByName,
	updateRestaurant,
	rateRestaurant,
	updateFood,
	deleteFoodById,
	getFoodById,
};
