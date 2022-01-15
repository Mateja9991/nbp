const jwt = require('jsonwebtoken');
const {
	UserRepositoryInstance: UserRepository,
} = require('../../db/repositories');
const { SOCKET_EVENTS } = require('../../constants');

const jwtSocketAuth = async (socketClient, sendEventToRoom) => {
	const { id } = jwt.verify(
		socketClient.handshake.auth.token,
		process.env.JWT_SECRET
	);
	const user = await UserRepository.getById(id);
	if (!user) {
		throw new Error('Not Authorized');
	}

	socketClient.user = user;
	socketClient.join(socketClient.user.id.toString(), function () {
		console.log('room joined');
		console.log(socketClient.rooms);
	});
	return;
};

module.exports = {
	jwtSocketAuth,
};
