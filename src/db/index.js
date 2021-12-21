const { redis, redisAsync } = require('./redis/index');

const { neoDriver } = require('./neo4j/index');

const { driverSessionPlugin } = require('../plugins/driver_session');

const mainSession = driverSessionPlugin(driver);

module.exports = {
	redis,
	redisAsync,
	mainSession,
};
