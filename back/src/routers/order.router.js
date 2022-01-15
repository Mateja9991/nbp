const express = require('express');

const {
	jwtAuthMiddleware,
	orderToUserAuth,
	orderToCarrier,
	orderToCustomerAuth,
	orderToInstanceAuth,
	foodToOrderAuth,
} = require('../middleware/auth/index');
const {
	createOrder,
	getOrderById,
	getOrdersInstance,
	getOrdersRestaurant,
	updateOrder,
	confirmOrder,
	deleteOrder,
	addFoodToOrder,
	deleteFoodFromOrder,
	markAsMade,
	deleteFoodRelationFromOrder,
	getFoodFromOrder,
	getPendingOrder,
	markAsDelivered,
} = require('../services/order.service');

const router = new express.Router();

//ROUTES

router.post('/orders/:restId', jwtAuthMiddleware, createOrder);

router.get('/orders/:orderId', jwtAuthMiddleware, getOrderById);

router.get('/orders/pending/:restId', jwtAuthMiddleware, getPendingOrder);

router.get(
	'/orders/:orderId/restaurant',
	jwtAuthMiddleware,
	getOrdersRestaurant
);

router.get('/orders/:orderId/instance', jwtAuthMiddleware, getOrdersInstance);

router.get(
	'/orders/:orderId/food',
	jwtAuthMiddleware,
	orderToUserAuth,
	getFoodFromOrder
);
router.patch(
	'/orders/:orderId/delivered',
	jwtAuthMiddleware,
	orderToCarrier,
	markAsDelivered
);

router.patch(
	'/orders/:orderId/mark-as-made',
	jwtAuthMiddleware,
	orderToInstanceAuth,
	markAsMade
);

router.patch(
	'/orders/:orderId/confirm',
	jwtAuthMiddleware,
	orderToCustomerAuth,
	confirmOrder
);

router.patch(
	'/orders/:orderId/add-food',
	jwtAuthMiddleware,
	orderToCustomerAuth,
	foodToOrderAuth,
	addFoodToOrder
);

router.patch(
	'/orders/:orderId/del-food',
	jwtAuthMiddleware,
	orderToCustomerAuth,
	foodToOrderAuth,
	deleteFoodFromOrder
);

router.patch(
	'/orders/:orderId/del-food-rel',
	jwtAuthMiddleware,
	orderToCustomerAuth,
	deleteFoodRelationFromOrder
);

router.delete(
	'/orders/:orderId',
	jwtAuthMiddleware,
	orderToCustomerAuth,
	deleteOrder
);

module.exports = router;
