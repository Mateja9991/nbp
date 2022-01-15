const {
	RestaurantRepository,
	RestaurantInstanceRepository,
	FoodRepository,
} = require('../../db/repositories/index');

const instanceToRestaurantAuth = async (req, res, next) => {
	try {
		const { id } = req.user;
		const instances = await RestaurantRepository.getAllInstances(id);
		const { instanceId } = req.params;
		if (!instances.map((inst) => inst.id).includes(parseInt(instanceId)))
			throw new Error('Instance Auth Failed.');
		req.instance = RestaurantInstanceRepository.getById(instanceId);
		next();
	} catch (e) {
		next(e);
	}
};

const foodToRestaurantAuth = async (req, res, next) => {
	try {
		const { id } = req.user;
		console.log(id);
		const menu = await RestaurantRepository.getAllFoodFromMenu(id);
		const { foodId } = req.params;
		console.log(foodId);
		console.log(menu.map((food) => food.id));
		if (!menu.map((food) => food.id).includes(parseInt(foodId)))
			throw new Error('Food Auth Failed.');
		req.food = FoodRepository.getById(foodId);
		next();
	} catch (e) {
		next(e);
	}
};

module.exports = {
	foodToRestaurantAuth,
	instanceToRestaurantAuth,
};
