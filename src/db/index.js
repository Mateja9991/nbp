const { redis, redisAsync } = require('./redis/index');

const { neoDriver } = require('./neo4j/');

const { driverSessionPlugin } = require('../plugins/driver_session');

const mainSession = driverSessionPlugin(neoDriver);

module.exports = {
	redis,
	redisAsync,
	mainSession,
};
