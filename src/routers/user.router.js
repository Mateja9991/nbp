const express = require('express');

const { jwtAuthMiddleware } = require('../middleware/auth/index');
const { createUserHandler } = require('../services/user.service');

const router = new express.Router();
//
//        ROUTES
//

//router.get('/napravi-notifikaciju', jwtAuthMiddleware, testNotif);

router.post('/users', createUserHandler);

//router.patch('/users/me', jwtAuthMiddleware, updateUserHandler);

//router.delete('/users/:userId', jwtAuthMiddleware, deleteAnyUserHandler);
//
//
//
module.exports = router;
