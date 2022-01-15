const { RestaurantRepository, OrderRepository } = require('../db/repositories');

async function attachPendingOrder(req, res, next) {
	try {
		const {
			params: { restId },
			user: { id: userId },
		} = req;
		let pendingOrder = await RestaurantRepository.getPendingOrder(
			restId,
			userId
		);
		if (!pendingOrder) {
			console.log('MAKING PENDING ORDER');
			pendingOrder = await OrderRepository.create(restId, userId);
		}
		console.log(pendingOrder);
		req.order = pendingOrder;
		req.orderId = pendingOrder.id;
		next();
	} catch (err) {
		next(err);
	}
}

module.exports = {
	attachPendingOrder,
};
