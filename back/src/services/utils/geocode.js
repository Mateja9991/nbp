const axios = require('axios');
const { json } = require('express/lib/response');
const { GEOAPI_KEY, GEOAPI_URL, IQ_KEY, IQ_URL } = require('../../constants');
const geocode = async (address) => {
	return axios.get(`${IQ_URL}`, {
		params: {
			key: IQ_KEY,
			q: address,
			format: 'json',
			limit: 1,
		},
	});
};
module.exports = {
	geocode,
};
