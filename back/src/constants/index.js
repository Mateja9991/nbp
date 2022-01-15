const {
	NEO4J_ENDPOINT,
	NEO4J_USERNAME,
	NEO4J_PASSWORD,
} = require('./neo4j.config');

const {
	REDIS_CONFIG,
	REDIS_CACHE_CONFIG,
	REDIS_QUEUE_CONFIG,
	REDIS_HOST,
	REDIS_PORT,
	REDIS_PASSWORD,
	REDIS_DB,
} = require('./redis.config');

const { PORT } = require('./server');

const { GEOAPI_KEY, GEOAPI_URL, IQ_KEY, IQ_URL } = require('./geocode');

const { SOCKET_EVENTS } = require('./socket_events');
module.exports = {
	SOCKET_EVENTS,
	IQ_KEY,
	IQ_URL,
	GEOAPI_KEY,
	GEOAPI_URL,
	PORT,
	NEO4J_ENDPOINT,
	NEO4J_USERNAME,
	NEO4J_PASSWORD,
	REDIS_CONFIG,
	REDIS_CACHE_CONFIG,
	REDIS_QUEUE_CONFIG,
	REDIS_HOST,
	REDIS_PORT,
	REDIS_PASSWORD,
	REDIS_DB,
};
