const SOCKET_EVENTS = {
	NEW_MESSAGE: 'new-message',
	NEW_CARRIER_POSITION: 'new-carrier-position',
	NEW_ORDER: 'new-order',
	NEW_DELIVERY: 'new-delivery',
	CARRIER_ACCEPTED_ORDER: 'carrier-accepted-order',
	CARRIER_DECLINED_ORDER: 'carrier-declined-order',
	RESTAURANT_ACCEPTED_ORDER: 'restaurant-accepted-order',
	RESTAURANT_DECLINED_ORDER: 'restaurant-declined-order',
	ORDER_READY: 'order-ready',
	RESTAURANTS_UNAVAILABLE: 'restaurants-unavailable',
	CARRIERS_UNAVAILABLE: 'carriers-unavailable',
	ORDER_DELETED: 'order-deleted',
};
module.exports = {
	SOCKET_EVENTS,
};
