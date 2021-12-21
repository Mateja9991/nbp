const redisConfig = {
	port: 6379,
	host: '192.168.164.251',
	family: 4, // 4 (IPv4) or 6 (IPv6)
	password: 'RedisPassword123?',
	db: 0,
};

const {
	REDIS_HOST = '192.168.164.251',
	REDIS_PORT = 6379,
	REDIS_PASSWORD = 'RedisPassword123?',
	REDIS_DB = 1,
	REDIS_CACHE_DB = 4,
	REDIS_QUEUE_DB = 3,
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

module.exports = {
	REDIS_CONFIG,
	REDIS_CACHE_CONFIG,
	REDIS_QUEUE_CONFIG,
	REDIS_HOST,
	REDIS_PORT,
	REDIS_PASSWORD,
	REDIS_DB,
};
