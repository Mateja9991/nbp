const { jwtAuthMiddleware } = require('./jwt_authorization_middleware');
const {
	instanceToRestaurantAuth,
	foodToRestaurantAuth,
} = require('./restaurant.auth');
const {
	orderToUserAuth,
	foodToOrderAuth,
	orderToCarrier,
	orderToCustomerAuth,
	orderToInstanceAuth,
} = require('./order.auth');
module.exports = {
	jwtAuthMiddleware,
	instanceToRestaurantAuth,
	orderToUserAuth,
	foodToOrderAuth,
	orderToCarrier,
	foodToRestaurantAuth,
	orderToCustomerAuth,
	orderToInstanceAuth,
};
