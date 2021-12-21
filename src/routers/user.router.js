const express = require('express');

const { jwtAuthMiddleware } = require('../middleware/auth/index');
const {
	registerCustomer,
	createCustomer,
	getAllCustomers,
	getCurrentUser,
	getAllUsers,
	updateUser,
	deleteUserById,
	deleteCurrentUser,
} = require('../services/user.service');

const router = new express.Router();
//
//        ROUTES
//

//router.get('/napravi-notifikaciju', jwtAuthMiddleware, testNotif);

router.post('/customers', registerCustomer);

router.get('/users/all', getAllUsers);

router.get('/customers/all', getAllCustomers);

router.get('/users/me', getCurrentUser);

router.patch('/users/me', updateUser);

router.delete('/users/me', deleteCurrentUser);

router.delete('/users/:userId', deleteUserById);

//router.patch('/users/me', jwtAuthMiddleware, updateUserHandler);

//router.delete('/users/:userId', jwtAuthMiddleware, deleteAnyUserHandler);
//
//
//
module.exports = router;
