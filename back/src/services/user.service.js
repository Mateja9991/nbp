const { destructureObject } = require('./utils');
const { USER_ROLES } = require('../constants/user_roles');
const {
	UserRepositoryInstance: UserRepository,
} = require('../db/repositories');
const { jwtAuthMiddleware } = require('../middleware/auth');
const Socket = require('../socket/socket');
const { redisSub, redisSubAsync, redisChatAsync } = require('../db');
const { json } = require('express/lib/response');
const {
	BaseRepositoryInstance: BaseRepository,
} = require('../db/repositories/base.repo');
//
//        ROUTER HANDLERS
//

//vraca sve usere ukljucujuci i restorane
async function getAllUsers(req, res, next) {
	try {
		const users = await UserRepository.getAll(req.query);

		return res.json(users);
	} catch (err) {
		next(err);
	}
}

async function uploadUserPicture(req, res, next) {
	try {
		const {
			body: { id },
		} = req;

		return res.json('working');
	} catch (err) {
		next(err);
	}
}

async function login(req, res, next) {
	try {
		const { username, password } = req.body;
		let payload = await UserRepository.login(username, password);
		const { user, token } = payload;
		const roles = await UserRepository.getUserRole(user.id);
		payload = {
			user: {
				...user,
				role: roles.reduce((acc, role) => (acc != 'User' ? acc : role), 'User'),
			},
			token,
		};
		if (roles.includes('Carrier')) {
			Socket.carrierLogin(user.id);
		}
		return res.json(payload);
	} catch (err) {
		next(err);
	}
}

async function getCurrentUser(req, res, next) {
	try {
		return res.json(req.user);
	} catch (err) {
		next(err);
	}
}

async function getUserById(req, res, next) {
	try {
		const { userId } = req.params;
		const user = await UserRepository.getById(userId);
		return res.json(user);
	} catch (err) {
		next(err);
	}
}

async function getUserByUsername(req, res, next) {
	try {
		const { username } = req.params;
		const user = await UserRepository.getUser({ username });
		return res.json(user);
	} catch (err) {
		next(err);
	}
}

async function updateCurrentUser(req, res, next) {
	try {
		const {
			user: { id },
			body,
		} = req;
		console.log(body);
		const updatedUser = await UserRepository.update(id, body);
		console.log(`UPDATED USER: ${JSON.stringify(updatedUser)}`);

		return res.json(updatedUser);
	} catch (err) {
		next(err);
	}
}

async function updateUserById(req, res, next) {
	try {
		const {
			params: { userId },
			body,
		} = req;
		const updatedUser = await UserRepository.update(userId, body);
		console.log(`UPDATED USER: ${updatedUser}`);
		return res.json(updatedUser);
	} catch (err) {
		next(err);
	}
}

async function deleteUserById(req, res, next) {
	try {
		const { userId } = req.params;
		await UserRepository.deleteById(userId);
		return res.json({ message: 'Deleted' });
	} catch (err) {
		next(err);
	}
}

async function deleteCurrentUser(req, res, next) {
	try {
		const { id } = req.user;
		await UserRepository.deleteById(id);
		return res.json({ message: 'Deleted' });
	} catch (err) {
		next(err);
	}
}

async function getMessageHistoryWithUser(req, res, next) {
	try {
		const {
			user: { id },
			params: { userId },
		} = req;
		let myMessages = await redisChatAsync.lrangeAsync(
			`Chat:${id}:${userId}`,
			0,
			-1
		);

		myMessages = myMessages.map((msg) => ({
			from: id,
			...JSON.parse(msg),
		}));
		let userMessages = await redisChatAsync.lrangeAsync(
			`Chat:${userId}:${id}`,
			0,
			-1
		);
		userMessages = userMessages.map((msg) => ({
			from: userId,
			...JSON.parse(msg),
		}));
		let messages = myMessages.concat(userMessages);
		messages = messages.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
		let { skip, limit } = req.query;
		skip = parseInt(skip);
		limit = parseInt(limit);
		messages = messages.slice(parseInt(skip), parseInt(skip) + parseInt(limit));
		messages = messages.reverse();

		return res.json(messages);
	} catch (err) {
		next(err);
	}
}

module.exports = {
	login,
	uploadUserPicture,
	getCurrentUser,
	getAllUsers,
	getUserById,
	getUserByUsername,
	updateCurrentUser,
	updateUserById,
	deleteUserById,
	deleteCurrentUser,
	getMessageHistoryWithUser,
};
