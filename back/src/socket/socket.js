const socketio = require('socket.io');
// const OnlineUsersServices = require('./utils/socket.utils');
const {
	SOCKET_EVENTS,
	// PING_INTERVAL = 1,
	// RESPONSE_TIMER = 1,
} = require('../constants');
const {
	UserRepositoryInstance: UserRepository,
	OrderRepository,
	RestaurantRepository,
	RestaurantInstanceRepository,
	CarrierRepository,
} = require('../db/repositories');
const {
	redisPub,
	redisPubAsync,
	redis,
	redisAsync,
	redisSub,
	redisSubAsync,
	redisChat,
	redisChatAsync,
} = require('../db/');

const { jwtSocketAuth } = require('./socket.auth/');

class SocketService {
	async initializeSocketServer(server) {
		this.io = socketio(server, {
			cors: {
				origin: '*',
				methods: '*',
			},
		});
		const roles = ['Carriers'];
		const cities = ['Nis'];
		const rolesPerCity = roles.map((role) =>
			cities.map((city) => `${role}:${city}`)
		);
		for (const roleInCity of rolesPerCity) {
			for (const roleCity of roleInCity) {
				const role = roleCity.slice(0, roleCity.indexOf('s:'));
				const city = roleCity.slice(roleCity.indexOf('s:') + 1);
				const redisUserIds = await redisAsync.zrangeAsync(roleCity, 0, -1);
				for (const redisUserId of redisUserIds) {
					const currentUser = await UserRepository.getById(redisUserId);
					const currentUserRoles = await UserRepository.getUserRole(
						currentUser.id
					);
					if (!currentUserRoles.includes(role)) {
						console.log(
							`deleted ${currentUser.username} from ${city}'s ${role}s redis db.`
						);
						await redisAsync.zremAsync(roleCity, currentUser.id);
					}
				}
			}
		}
		this.io
			.use(this.middleware.bind(this))
			.on('connection', this._userOnConnect.bind(this));
		redisSub.unsubscribe();
		// redisChatSub.unsubscribe();
		// redisChatSub.on('message', async (receiverId, payload) => {});
		redisSub.on('message', async (channel, payload) => {
			if (channel.includes('chat:')) {
				const room = channel.slice(channel.indexOf(':') + 1);
				console.log(room);
				this.sendEventToRoom(room, SOCKET_EVENTS.NEW_MESSAGE, payload);
			} else {
				console.log('caught!');
				const carrierId = channel;
				const customers = await redisAsync.lrangeAsync(
					`${carrierId}:Customers`,
					0,
					-1
				);
				const { lat, lon } = JSON.parse(payload);
				// console.log(`${carrierId} new location ${lat} ${lon}`);
				customers.forEach((customerId) => {
					console.log(
						`Sending ${lat} ${lon} via ${SOCKET_EVENTS.NEW_CARRIER_POSITION} to room: ${customerId}`
					);
					this.sendEventToRoom(customerId, SOCKET_EVENTS.NEW_CARRIER_POSITION, {
						lat,
						lon,
					});
				});
			}
		});
	}
	async middleware(socketClient, next) {
		try {
			await jwtSocketAuth(socketClient, this.sendEventToRoom.bind(this));
			if (!socketClient.user) {
				next(new Error('Not Authorized'));
			}
			next();
		} catch (e) {
			console.log(e.message);
			next(new Error('Not Authorized'));
		}
	}
	async carrierLogin(carrierId) {
		redisSub.unsubscribe(carrierId);
		redisSub.subscribe(carrierId, (err, count) => {
			if (err) {
				console.error('Failed to subscribe: %s', err.message);
			} else {
				console.log(`Subscribed successfully! ${count} channels.`);
			}
		});
	}
	async _userOnConnect(socketClient) {
		redisSub.unsubscribe(`chat:${socketClient.user.id}`);
		redisSub.subscribe(`chat:${socketClient.user.id}`, (err, count) => {
			if (err) {
				console.error('Failed to subscribe: %s', err.message);
			} else {
				console.log(`Subscribed successfully! ${count} channels.`);
			}
		});
		redisSub.unsubscribe(`${socketClient.user.id}`);
		redisSub.subscribe(`${socketClient.user.id}`, (err, count) => {
			if (err) {
				console.error('Failed to subscribe: %s', err.message);
			} else {
				console.log(`Subscribed successfully! ${count} channels.`);
			}
		});
		socketClient.use(async (packet, next) => {
			try {
				socketClient.user = await UserRepository.getById(socketClient.user.id);
			} catch (err) {
				next(err);
			}
			next();
		});
		socketClient.on('disconnect', async () => {
			console.log('Tab closed');
		});
		socketClient.on('whoAmI', async (username, id) => {
			//console.log(`${username}-${socketClient.user.username} got checked `);
			try {
				if (socketClient.user && socketClient.user.id !== parseInt(id)) {
					console.log(
						`${socketClient.user.id} on socketClient and ${id} came in.`
					);
					if (id) socketClient.user = await UserRepository.getById(id);
					console.log('MISMATCH');
					console.log(socketClient.user);
					console.log(username);
				}
			} catch (err) {
				console.log(err);
			}
		});
		socketClient.on('logout', () => {
			socketClient.disconnect(true);
		});
		// socketClient.on('loginAsInstance', async (instanceId) => {
		// 	socketClient.join(instanceId.toString(), () => {
		// 		console.log('joined room ' + instanceId.toString());
		// 	});
		// });
		// socketClient.on('logoutAsInstance', async (instanceId) => {
		// 	socketClient.leave(instanceId, () => {
		// 		console.log('left room ' + instanceId.toString());
		// 	});
		// });
		socketClient.on('carrierPositionChanged', async (lat, lon) => {
			const {
				user: { city, id },
			} = socketClient;
			const roles = await UserRepository.getUserRole(id);
			if (!roles.includes('Carrier')) {
				console.log('not a carrier.');
				return;
			}
			await redisAsync.geoAddAsync(city, lat, lon, id);
			await redisAsync.geoAddAsync(`Carriers:${city}`, lat, lon, id);
			console.log(`publishing address to ${id}.`);
			redisPub.publish(id, JSON.stringify({ lat, lon }));
		});
		socketClient.on('orderConfirmed', async (orderId) => {
			console.log('order je potvrdjen ' + orderId);
			const {
				user: { city, id: userId },
			} = socketClient;
			const { id: restId } = await OrderRepository.getOrdersRestaurant(orderId);
			let instanceIds = await RestaurantRepository.getAllInstances(restId);
			instanceIds = instanceIds.filter((inst) => inst.city == city);
			const instDist = await Promise.all(
				instanceIds.map(async ({ id: instId }) => {
					const instPos = (await redisAsync.geoPosAsync(city, instId))[0];
					return {
						lat: instPos[0],
						lon: instPos[1],
						dist: parseInt(
							await redisAsync.geoDistAsync(city, userId, instId, 'm')
						),
						id: instId,
					};
				})
			);
			console.log(instDist);
			instDist.sort((a, b) => a.dist - b.dist);
			let i;
			for (
				i = 0;
				i < instDist.length - 1;
				await redisAsync.setAsync(
					`${orderId}:${instDist[i++].id}`,
					instDist[i].id
				)
			) {}
			await redisAsync.setAsync(`${orderId}:${instDist[i].id}`, null);
			for (i = 0; i < instDist.length; i++) {
				console.log(`ID ${instDist[i].id} next je:`);
				console.log(await redisAsync.getAsync(`${orderId}:${instDist[i].id}`));
			}
			// Socket.sendEventToRoom(instDist[0].id, SOCKET_EVENTS.NEW_ORDER, {
			// 	orderId,
			// });
			console.log(instDist);
			const currentOrders = await redisAsync.lrangeAsync(
				`${instDist[0].id}:Orders`,
				0,
				-1
			);
			console.log(currentOrders);
			if (!currentOrders.includes(orderId.toString()))
				await redisAsync.lpushAsync(`${instDist[0].id}:Orders`, orderId);
			console.log(`${instDist[0].id}:Orders`);

			console.log(
				await redisAsync.lrangeAsync(`${instDist[0].id}:Orders`, 0, -1)
			);
			Socket.sendEventToRoom(instDist[0].id, SOCKET_EVENTS.NEW_ORDER, {
				orderId,
			});
		});
		socketClient.on('carrierLogin', async () => {
			const {
				user: { id: carrierId },
			} = socketClient;
			if (!roles.includes('Carrier')) {
				console.log('not a carrier.');
				return;
			}
			redisSub.subscribe(carrierId, (err, count) => {
				if (err) {
					console.error('Failed to subscribe: %s', err.message);
				} else {
					console.log(`Subscribed successfully! ${count} channels.`);
				}
			});
			// redisSub.on('message', async (carrierId, payload) => {
			// 	console.log('MESSSAGE SUBSCRIBE');
			// 	const customers = await redisAsync.lrangeAsync(
			// 		`${carrierId}:Customers`,
			// 		0,
			// 		-1
			// 	);
			// 	const { lat, lon } = JSON.parse(payload);
			// 	console.log(`${carrierId} new location ${lat} ${lon}`);
			// 	customers.forEach((customer) => {
			// 		this.sendEventToRoom(
			// 			customer.id,
			// 			SOCKET_EVENTS.NEW_CARRIER_POSITION,
			// 			{ lat, lon }
			// 		);
			// 	});
			// });
		});
		socketClient.on('restaurantInstanceAcceptedOrder', async (orderId) => {
			const {
				user: { id: instanceId },
			} = socketClient;
			const roles = await UserRepository.getUserRole(instanceId);
			if (!roles.includes('RestaurantInstance')) {
				console.log('not a rest instance.');
				return;
			}
			console.log(await redisAsync.lrangeAsync(`${instanceId}:Orders`, 0, -1));
			await redisAsync.lremAsync(`${instanceId}:Orders`, 0, orderId.toString());
			console.log(await redisAsync.lrangeAsync(`${instanceId}:Orders`, 0, -1));
			console.log('deleted ??? ');
			const instance = await RestaurantInstanceRepository.getById(instanceId);
			await OrderRepository.beingMadeByInstace(orderId, instanceId);
			console.log(instance);
			const { city } = instance;
			const restPos = (await redisAsync.geoPosAsync(city, instanceId))[0];
			const MAX_DISTANCE = 10000;
			const carrierIds = await redisAsync.geoRadiusAsync(
				`Carriers:${city}`,
				restPos[0],
				restPos[1],
				MAX_DISTANCE,
				'm',
				'ASC'
			);
			console.log('CARRIER IDS');
			console.log(carrierIds);
			let availableCarriers = [];
			for (let carrId of carrierIds) {
				availableCarriers.push(await CarrierRepository.getById(carrId));
			}
			console.log('ACTUAL CARRIERS');
			console.log(availableCarriers);
			availableCarriers = availableCarriers.filter((carr) => carr.city == city);
			availableCarriers = await Promise.all(
				availableCarriers.map(async ({ id: carrId }) => {
					const carrPos = (await redisAsync.geoPosAsync(city, carrId))[0];
					return {
						lat: carrPos[0],
						lon: carrPos[1],
						dist: parseInt(
							await redisAsync.geoDistAsync(city, instanceId, carrId, 'm')
						),
						id: carrId,
					};
				})
			);
			availableCarriers.sort((a, b) => a.dist - b.dist);
			let i;
			for (
				i = 0;
				i < availableCarriers.length - 1;
				await redisAsync.setAsync(
					`${orderId}:${availableCarriers[i++].id}`,
					availableCarriers[i].id
				)
			) {}
			await redisAsync.setAsync(`${orderId}:${availableCarriers[i].id}`, null);
			for (i = 0; i < availableCarriers.length; i++) {
				console.log(
					`currentID ${
						availableCarriers[i].id
					} nextId: ${await redisAsync.getAsync(
						`${orderId}:${availableCarriers[i].id}`
					)}`
				);
			}
			console.log('DONE LISTING');
			console.log(availableCarriers);
			console.log(`sending event to carrier ${availableCarriers[0].id}`);
			const currentDeliveries = await redisAsync.lrangeAsync(
				`${availableCarriers[0].id}:Deliveries`,
				0,
				-1
			);
			if (!currentDeliveries.includes(orderId.toString()))
				await redisAsync.lpushAsync(
					`${availableCarriers[0].id}:Deliveries`,
					orderId
				);
			const user = await OrderRepository.getCustomer(orderId);
			const userToInstDist = await redisAsync.geoDistAsync(
				city,
				instanceId,
				user.id,
				'm'
			);
			const deliveryPrice = Math.floor(parseInt(userToInstDist) * 0.1);
			console.log(userToInstDist);
			console.log(deliveryPrice);
			await OrderRepository.update(orderId, { deliveryPrice });
			this.sendEventToRoom(
				availableCarriers[0].id,
				SOCKET_EVENTS.NEW_DELIVERY,
				orderId
			);
			this.sendEventToRoom(instanceId, SOCKET_EVENTS.ORDER_DELETED, orderId);
		});
		socketClient.on('restaurantInstanceDeclinedOrder', async (orderId) => {
			const {
				user: { id: currentId },
			} = socketClient;
			console.log(socketClient.user);
			const roles = await UserRepository.getUserRole(currentId);
			if (!roles.includes('RestaurantInstance')) {
				console.log('not a rest instance.');
				return;
			}
			console.log('deleting order');
			console.log(orderId);
			console.log(await redisAsync.lrangeAsync(`${currentId}:Orders`, 0, -1));
			await redisAsync.lremAsync(`${currentId}:Orders`, 0, orderId.toString());
			console.log(await redisAsync.lrangeAsync(`${currentId}:Orders`, 0, -1));
			console.log('deleted ??? ');
			const nextId = await redisAsync.getAsync(`${orderId}:${currentId}`);
			console.log('next id');
			console.log(nextId);
			await redisAsync.lremAsync(`${nextId}:Orders`, 0, orderId.toString());
			if (nextId) {
				await redisAsync.lpushAsync(`${nextId}:Orders`, orderId);
				this.sendEventToRoom(nextId, SOCKET_EVENTS.NEW_ORDER, { orderId });
			} else {
				const { id } = await OrderRepository.getCustomer(orderId);
				this.sendEventToRoom(id, SOCKET_EVENTS.RESTAURANTS_UNAVAILABLE, {
					status: 'restaruants unavailible',
				});
			}
			this.sendEventToRoom(currentId, SOCKET_EVENTS.ORDER_DELETED, orderId);
		});
		socketClient.on('orderReady', async (orderId) => {
			const {
				user: { id: instanceId },
			} = socketClient;
			const roles = await UserRepository.getUserRole(instanceId);
			if (!roles.includes('RestaurantInstance')) {
				console.log('not a rest instance.');
				return;
			}
			const order = await OrderRepository.getById(orderId);
			const customer = await OrderRepository.getCustomer(orderId);
			this.sendEventToRoom(
				customer.id,
				SOCKET_EVENTS.ORDER_READY,
				JSON.stringify(order)
			);
			const carrier = await OrderRepository.getCarrier(orderId);
			this.sendEventToRoom(
				carrier.id,
				SOCKET_EVENTS.ORDER_READY,
				JSON.stringify(order)
			);
			this.sendEventToRoom(instanceId, SOCKET_EVENTS.ORDER_DELETED, orderId);
		});
		socketClient.on('carrierAcceptedOrder', async (orderId) => {
			const {
				user: { id: carrierId },
			} = socketClient;
			const roles = await UserRepository.getUserRole(carrierId);
			if (!roles.includes('Carrier')) {
				console.log('not a carrier.');
				return;
			}
			const customer = await OrderRepository.getCustomer(orderId);
			this.sendEventToRoom(customer.id, SOCKET_EVENTS.CARRIER_ACCEPTED_ORDER, {
				orderId,
			});
			const instance = await OrderRepository.getOrdersInstance(orderId);
			this.sendEventToRoom(instance.id, SOCKET_EVENTS.CARRIER_ACCEPTED_ORDER, {
				orderId,
			});
			await OrderRepository.markAsDelivering(carrierId, orderId);
			console.log(
				await redisAsync.lrangeAsync(`${carrierId}:Deliveries`, 0, -1)
			);
			await redisAsync.lremAsync(
				`${carrierId}:Deliveries`,
				0,
				orderId.toString()
			);
			console.log(
				await redisAsync.lrangeAsync(`${carrierId}:Deliveries`, 0, -1)
			);
			console.log('deleted ??? ');
			await redisAsync.lremAsync(
				`${carrierId}:Customers`,
				0,
				customer.id.toString()
			);
			await redisAsync.lpushAsync(
				`${carrierId}:Customers`,
				customer.id.toString()
			);
			this.sendEventToRoom(carrierId, SOCKET_EVENTS.ORDER_DELETED, orderId);

			// redisSub.unsubscribe(carrierId);
			// redisSub.subscribe(carrierId, (err, count) => {
			// 	if (err) {
			// 		console.error('Failed to subscribe: %s', err.message);
			// 	} else {
			// 		console.log(`Subscribed successfully! ${count} channels.`);
			// 	}
			// });
		});
		socketClient.on('carrierDeclinedOrder', async (orderId) => {
			const {
				user: { id: currentId },
			} = socketClient;
			const roles = await UserRepository.getUserRole(currentId);
			if (!roles.includes('Carrier')) {
				console.log('not a carrier.');
				return;
			}
			const nextId = await redisAsync.getAsync(`${orderId}:${currentId}`);
			console.log(nextId);
			console.log(socketClient.user);
			console.log(
				await redisAsync.lrangeAsync(`${currentId}:Deliveries`, 0, -1)
			);
			await redisAsync.lremAsync(
				`${currentId}:Deliveries`,
				0,
				orderId.toString()
			);
			console.log(
				await redisAsync.lrangeAsync(`${currentId}:Deliveries`, 0, -1)
			);
			console.log('deleted?');
			if (nextId) {
				await redisAsync.lremAsync(
					`${nextId}:Deliveries`,
					0,
					orderId.toString()
				);
				await redisAsync.lpushAsync(`${nextId}:Deliveries`, orderId.toString());
				console.log(
					await redisAsync.lrangeAsync(`${nextId}:Deliveries`, 0, -1)
				);
				this.sendEventToRoom(nextId, SOCKET_EVENTS.NEW_DELIVERY, { orderId });
			} else {
				const { id } = await OrderRepository.getCustomer(orderId);
				const { id: instanceId } = await OrderRepository.getOrdersInstance(
					orderId
				);
				await OrderRepository.unlinkFromInstance(orderId, instanceId);
				this.sendEventToRoom(id, SOCKET_EVENTS.CARRIERS_UNAVAILABLE, {
					status: 'carriers unavailible',
				});
			}
			this.sendEventToRoom(currentId, SOCKET_EVENTS.ORDER_DELETED, orderId);
		});
		socketClient.on('newMessageToUser', async (username, payload) => {
			try {
				const user = await UserRepository.getUser({ username });
				const { id } = socketClient.user;
				const { id: channel } = user;
				let { msg } = payload;
				msg = { createdAt: Date.now(), text: msg };
				//cosnt payload
				console.log(`Chat:${id}:${channel}`);
				console.log(JSON.stringify(msg));
				await redisChatAsync.lpushAsync(
					`Chat:${id}:${channel}`,
					JSON.stringify(msg)
				);
				console.log(
					`NEW MESSAGE TO ${user.username} payload: ${JSON.stringify(payload)}`
				);
				redisPub.publish(`chat:${channel}`, JSON.stringify(payload));
			} catch (e) {
				console.log(e);
			}
		});
	}
	sendEventToRoom(room, eventName, payload) {
		this.io.to(room.toString()).emit(eventName, payload);
	}
}
const Socket = new SocketService();

async function sendMessageEvent(room, payload) {
	Socket.sendEventToRoom(room, SOCKET_EVENTS.NEW_MESSAGE, payload);
}

async function sendMessageToSessionHandler(sessionId, senderId, message) {
	try {
	} catch (e) {
		console.log(e);
	}
}

module.exports = Socket;
