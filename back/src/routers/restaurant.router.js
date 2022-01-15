const express = require('express');

const {
	jwtAuthMiddleware,
	instanceToRestaurantAuth,
	foodToRestaurantAuth,
	foodToOrderAuth,
	orderToUserAuth,
	orderToCustomerAuth,
	orderToInstanceAuth,
} = require('../middleware/auth/index');
const {
	registerRestaurant,
	getAllRestaurants,
	getAllRestaurantInstances,
	getRestaurantReviews,
	getRestaurantOrders,
	addFoodToRestaurant,
	getFoodFromMenu,
	updateFood,
	updateRestaurant,
	searchRestaurantsByName,
	rateRestaurant,
	deleteFoodById,
	getAvailableFoodTypes,
	getFoodById,
} = require('../services/restaurant.service');

const {
	deleteFoodFromOrder,
	addFoodToOrder,
} = require('../services/order.service');
const { attachPendingOrder } = require('../middleware');
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const fullPath = path.join(__dirname, '..', '..', 'public', 'img');

		cb(null, fullPath);
	},
	filename: function (req, file, cb) {
		const {
			user: { id },
		} = req;
		//file.fieldname + '-' +
		cb(null, id + '.jpg');
	},
});
const foodStorage = multer.diskStorage({
	destination: function (req, file, cb) {
		const fullPath = path.join(__dirname, '..', '..', 'public', 'img');

		cb(null, fullPath);
	},
	filename: function (req, file, cb) {
		const {
			params: { foodId },
		} = req;
		//file.fieldname + '-' +
		cb(null, foodId + '.jpg');
	},
});
const upload = multer({ storage: storage });
const uploadFoodImg = multer({ storage: foodStorage });
const router = new express.Router();

//ROUTES

router.post('/restaurants', registerRestaurant);

router.post('/restaurants/me/food', jwtAuthMiddleware, addFoodToRestaurant);

router.get(
	'/restaurants/:restaurantId/food-types',
	jwtAuthMiddleware,
	getAvailableFoodTypes
);

router.get(
	'/restaurants/search/:name',
	jwtAuthMiddleware,
	searchRestaurantsByName
);

router.get(
	'/restaurants/instances',
	jwtAuthMiddleware,
	getAllRestaurantInstances
);
router.get('/restaurants/all', jwtAuthMiddleware, getAllRestaurants);

router.get(
	'/restaurants/:restaurantId/food',
	jwtAuthMiddleware,
	getFoodFromMenu
);

router.get('/restaurants/food/:foodId', jwtAuthMiddleware, getFoodById);

router.get(
	'/restaurants/:restaurantId/reviews',
	jwtAuthMiddleware,
	getRestaurantReviews
);

router.get('/restaurants/orders', jwtAuthMiddleware, getRestaurantOrders);

router.patch(
	'/restaurants',

	jwtAuthMiddleware,
	upload.single('profileImg'),
	updateRestaurant
);
router.patch('/restaurants/:restId/rate', jwtAuthMiddleware, rateRestaurant);
router.patch(
	'/restaurants/food/:foodId',
	jwtAuthMiddleware,
	uploadFoodImg.single('foodImg'),
	foodToRestaurantAuth,
	updateFood
);

router.patch(
	'/restaurants/:restId/add-food-order',
	jwtAuthMiddleware,
	attachPendingOrder,
	orderToCustomerAuth,
	foodToOrderAuth,
	addFoodToOrder
);

router.patch(
	'/restaurants/:restId/del-food-order',
	jwtAuthMiddleware,
	attachPendingOrder,
	orderToCustomerAuth,
	foodToOrderAuth,
	deleteFoodFromOrder
);

router.delete(
	'/restaurants/food/:foodId',
	jwtAuthMiddleware,
	foodToRestaurantAuth,
	deleteFoodById
);

module.exports = router;
