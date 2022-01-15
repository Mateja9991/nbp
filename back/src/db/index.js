const {
	cacheClient,
	cacheClientAsync,
	redisPub,
	redisPubAsync,
	redisSub,
	redisSubAsync,
	redis,
	redisAsync,
	redisChat,
	redisChatAsync,
} = require('./redis/index');

const { neoDriver } = require('./neo4j/');

const { driverSessionPlugin } = require('../plugins/driver_session');

const mainSession = driverSessionPlugin(neoDriver);

module.exports = {
	cacheClient,
	cacheClientAsync,
	redisPub,
	redisPubAsync,
	redisSub,
	redisSubAsync,
	redis,
	redisAsync,
	redisChat,
	redisChatAsync,
	mainSession,
};
