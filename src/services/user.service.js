const { destructureObject } = require('./utils');

const { jwtAuthMiddleware } = require('../middleware/auth');
//
//        ROUTER HANDLERS
//
async function createUserHandler(req, res, next) {
	{
		try {
			res.send({ success: 'True' });
		} catch (e) {
			next(e);
		}
	}
}

module.exports = {
	createUserHandler,
};
