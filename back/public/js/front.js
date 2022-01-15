var globalVariable = false;

const URL = 'http://localhost:3000/';
var socket;
var fetchedToken;
const $requestButton = document.querySelector('.request-button');
const $requestInput = document.querySelector('.request');
const $methodInput = document.querySelector('.method');
const $bodyInput = document.querySelector('.body');
const $response = document.querySelector('.response');
$requestButton.addEventListener('click', async () => {
	const route = $requestInput.value;
	const method = $methodInput.value;
	let body = $bodyInput.value;
	fetch(URL + route, {
		method: method,
		headers: {
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + fetchedToken,
		},
		body: body ? body : undefined,
	})
		.then(async (response) => {
			const jsonResponse = await response.json();
			return { jsonResponse };
		})
		.then(({ jsonResponse }) => {
			if (route === 'users/login' && jsonResponse.token) {
				const URL = 'http://localhost:3000/';
				const {
					user: { roles },
				} = jsonResponse;
				socket = io({
					withCredentials: true,
					auth: { token: jsonResponse.token },
				});
				// socket.emit('authorize', jsonResponse.token);
				socket.on('check-connection', (id) => {
					console.log('still');
					socket.emit('keep-alive', id);
				});
				fetchedToken = jsonResponse.token;
				socket.on('connect_error', (err) => {
					console.log(err.message); // prints the message associated with the error
				});
				if (roles.includes('Restaurant')) {
					socket.on('new-order', (payload) => {
						console.log(payload); // prints the message associated with the error
						socket.emit(
							'restaurantAcceptedOrder',
							payload.instanceId,
							payload.orderId
						);
					});
				}
				socket.on('new-message', ({ team, user, message }) => {
					console.log(team, user, message);
					$messageBoard.innerHTML += `<p>${user.username}:${message.text}</p>`;
				});

				socket.on('carrier-accepted-order', (payload) => {
					console.log(payload); // prints the message associated with the error
				});
				socket.on('carrier-declined-order', (payload) => {
					console.log(payload); // prints the message associated with the error
				});
				socket.on('new-carrier-destination', (payload) => {
					console.log(payload); // prints the message associated with the error
				});
				socket.on('restaurant-accepted-order', (payload) => {
					console.log(payload);
				});
				socket.on('restaurant-declined-orderr', (payload) => {
					console.log(payload);
				});
				socket.on('restaurants-unavailable', (payload) => {
					console.log(payload);
				});
				socket.on('carriers-unavailable', (payload) => {
					console.log(payload);
				});
				socket.on('error', (error) => {
					console.log(error);
				});
				socket.on('check-connection', (id) => {
					console.log('still');
					socket.emit('keep-alive', id);
				});
				if (roles.includes('Carrier')) {
					socket.on('new-delivery', (payload) => {
						console.log(payload); // prints the message associated with the error
						socket.emit('carrierAcceptedOrder', payload);
					});
					setInterval(() => {
						navigator.geolocation.getCurrentPosition((position) => {
							socket.emit(
								'carrierPositionChanged',
								position.coords.latitude,
								position.coords.longitude
							);
						});
					}, 1000);
				}
			}
			console.log(jsonResponse);
			const keys = Object.keys(jsonResponse);
			if (jsonResponse['token']) fetchedToken = jsonResponse['token'];
			if (jsonResponse['error']) {
				console.log(jsonResponse);
				return;
			}
			$response.innerHTML = '';
			keys.forEach((key) => {
				$response.innerHTML += key + ': ' + jsonResponse[key] + '<br/>';
			});
		})
		.catch((error) => {
			console.log(error);
		});
});
