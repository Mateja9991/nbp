const { destructureObject } = require('./utils');
const { USER_ROLES } = require('../constants/user_roles');
const { UserRepository } = require('../db/repositories');
const { jwtAuthMiddleware } = require('../middleware/auth');
//
//        ROUTER HANDLERS
//

async function registerCustomer(req, res, next) {
	try {
		const payload = await UserRepository.register(req.body);
		return res.json(payload);
	} catch (err) {
		next(err);
	}
}

async function getAllUsers(req, res, next) {
	try {
		const users = await UserRepository.getAll(req.query);
		return res.json(users);
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

async function getAllCustomers(req, res, next) {
	try {
		return res.json(req.user);
	} catch (err) {
		next(err);
	}
	const users = await UserRepository.getAllManagers(req.query);
	return res.json(users);
}

async function getUserById(req, res, next) {
	try {
		return res.json(req.user);
	} catch (err) {
		next(err);
	}
	const { id } = req.params;
	const user = await UserRepository.getById(id);
	return res.json(user);
}

async function createCustomer(req, res, next) {
	try {
		const customer = await UserRepository.createCustomer(req.body);
		return res.json(customer);
	} catch (err) {
		next(err);
	}
}

async function updateUser(req, res, next) {
	try {
		const {
			params: { id },
			body,
		} = req;
		const user = await UserRepository.update(id, body);
		return res.json(user);
	} catch (err) {}
}

async function deleteUserById(req, res, next) {
	try {
		const { id } = req.params;
		await UserRepository.deleteById(id);
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

module.exports = {
	registerCustomer,
	createCustomer,
	getCurrentUser,
	getAllUsers,
	getAllCustomers,
	updateUser,
	deleteUserById,
	deleteCurrentUser,
};
