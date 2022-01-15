const express = require('express');

const { jwtAuthMiddleware } = require('../middleware/auth/index');
const {
	login,
	getCurrentUser,
	getUserByUsername,
	getUserById,
	getAllUsers,
	updateCurrentUser,
	updateUserById,
	deleteUserById,
	deleteCurrentUser,
	uploadUserPicture,
	getMessageHistoryWithUser,
} = require('../services/user.service');
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

const upload = multer({ storage: storage });
//
//        ROUTES
//

//router.get('/napravi-notifikaciju', jwtAuthMiddleware, testNotif);

router = express.Router();

router.post('/users/login', login);

router.post(
	'/users/upload',
	jwtAuthMiddleware,
	upload.single('profileImage'),
	uploadUserPicture
);

router.get('/users/all', jwtAuthMiddleware, getAllUsers);

router.get('/users/username/:username', jwtAuthMiddleware, getUserByUsername);

router.get('/users/me', jwtAuthMiddleware, getCurrentUser);

router.get('/users/:userId', jwtAuthMiddleware, getUserById);

router.get('/users/chat/:userId', jwtAuthMiddleware, getMessageHistoryWithUser);

router.patch('/users/me', jwtAuthMiddleware, updateCurrentUser);

router.patch('/users/:userId', jwtAuthMiddleware, updateUserById);

router.delete('/users/me', jwtAuthMiddleware, deleteCurrentUser);

router.delete('/users/:userId', jwtAuthMiddleware, deleteUserById);

//router.patch('/users/me', jwtAuthMiddleware, updateUserHandler);

//router.delete('/users/:userId', jwtAuthMiddleware, deleteAnyUserHandler);
//
//
//
module.exports = router;
