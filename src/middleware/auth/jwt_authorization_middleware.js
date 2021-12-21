const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = async (req, res, next) => {
	try {
		const token = req.header('Authorization').replace('Bearer ', '');
		//const { _id } = jwt.verify(token, process.env.TOKEN_KEY);
		// const user = await User.findById(_id);
		// if (!user) {
		// 	res.status(404);
		// 	throw new Error('User not found');
		//}
		const user = await UserRepository.getById(id);
		if (user) {
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
