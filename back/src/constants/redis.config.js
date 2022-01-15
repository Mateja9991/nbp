const { IP_ADDR } = require('./network');

const {
	REDIS_HOST = IP_ADDR,
	REDIS_PORT = 6379,
	REDIS_PASSWORD = 'RedisPassword123?',
	REDIS_DB = 1,
	REDIS_CACHE_DB = 4,
	REDIS_QUEUE_DB = 3,
	REDIS_CHAT_DB = 5,
} = process.env;

const REDIS_CONFIG = {
	host: REDIS_HOST,
	port: REDIS_PORT,
	db: REDIS_DB,
	password: REDIS_PASSWORD,
};

const REDIS_CACHE_CONFIG = {
	host: REDIS_HOST,
	port: REDIS_PORT,
	db: REDIS_CACHE_DB,
	password: REDIS_PASSWORD,
};

const REDIS_QUEUE_CONFIG = {
	host: REDIS_HOST,
	port: REDIS_PORT,
	db: REDIS_QUEUE_DB,
	password: REDIS_PASSWORD,
};

const REDIS_CHAT_CONFIG = {
	host: REDIS_HOST,
	port: REDIS_PORT,
	db: REDIS_CHAT_DB,
	password: REDIS_PASSWORD,
};

module.exports = {
	REDIS_CONFIG,
	REDIS_CACHE_CONFIG,
	REDIS_QUEUE_CONFIG,
	REDIS_CHAT_CONFIG,
	REDIS_HOST,
	REDIS_PORT,
	REDIS_PASSWORD,
	REDIS_DB,
};
