const { promisify } = require('util');
const Redis = require('ioredis');
const redisConfig = require('../../constants/redis.config');

const redis = new Redis(redisConfig);

const getAsync = promisify(redis.get.bind(redis));
const setAsync = promisify(redis.set.bind(redis));

module.exports = {
	redis,
	getAsync,
	setAsync,
};
