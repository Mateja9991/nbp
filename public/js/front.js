var globalVariable = false;

const URL = 'http://localhost:3000/';

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
			if (jsonResponse.pic) return { jsonResponse, picture: true };
			return { jsonResponse, picture: false };
		})
		.then(({ jsonResponse, picture }) => {
			console.log(jsonResponse);
			const keys = Object.keys(jsonResponse);
			if (jsonResponse['token']) fetchedToken = jsonResponse['token'];
			if (jsonResponse['error']) {
				console.log(jsonResponse);
				return;
			}
			if (picture) {
				$response.innerHTML = '';
				var imageElem = document.createElement('img');

				imageElem.src = 'data:image/png;base64,' + jsonResponse.pic;
				$response.appendChild(imageElem);
			} else {
				$response.innerHTML = '';
				keys.forEach((key) => {
					$response.innerHTML += key + ': ' + jsonResponse[key] + '<br/>';
				});
			}
		})
		.catch((error) => {
			console.log(error);
		});
});
