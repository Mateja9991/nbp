const jwt = require('jsonwebtoken');
const {
	UserRepositoryInstance: UserRepository,
} = require('../../db/repositories/index');
const jwtAuthMiddleware = async (req, res, next) => {
	try {
		const token = req.header('Authorization').replace('Bearer ', '');
		const { id } = jwt.verify(token, process.env.JWT_SECRET);
		const user = await UserRepository.getById(id);
		if (user) {
			console.log(`${user.username} sent request.`);
			req.id = id;
			req.user = user;
		} else {
			throw new Error();
		}
		next();
	} catch (e) {
		next(e);
	}
};

module.exports = {
	jwtAuthMiddleware,
};
