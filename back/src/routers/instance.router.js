const express = require('express');
const {
	jwtAuthMiddleware,
	instanceToRestaurantAuth,
} = require('../middleware/auth/index');
const {
	registerInstance,
	updateInstance,
	getInstanceOrders,
	getInstanceCurrentOrders,
	getInstancePendingOrders,
	getFoodFromInstanceMenu,
	deleteInstanceById,
} = require('../services/instance.service');

const router = new express.Router();

router.post('/instances', jwtAuthMiddleware, registerInstance);

router.get('/instances/menu', jwtAuthMiddleware, getFoodFromInstanceMenu);

router.get(
	'/instances/pending-orders',
	jwtAuthMiddleware,
	getInstancePendingOrders
);

router.get(
	'/instances/current-orders',
	jwtAuthMiddleware,
	getInstanceCurrentOrders
);

router.get('/instances/orders', jwtAuthMiddleware, getInstanceOrders);

router.patch('/instances', jwtAuthMiddleware, updateInstance);

router.delete(
	'/instances/:instanceId',
	jwtAuthMiddleware,
	instanceToRestaurantAuth,
	deleteInstanceById
);

module.exports = router;
