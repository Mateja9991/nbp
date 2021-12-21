const { promisify } = require('util');
const Redis = require('ioredis');
const {
	REDIS_CONFIG,
	REDIS_CACHE_CONFIG,
	REDIS_QUEUE_CONFIG,
	REDIS_HOST,
	REDIS_PORT,
	REDIS_PASSWORD,
	REDIS_DB,
} = require('../../constants/redis.config');

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

const getClient = (CONFIG) => {
	const redis = new Redis(CONFIG);
	const redisAsync = {
		getAsync: promisify(redis.get.bind(redis)),
		setAsync: promisify(redis.set.bind(redis)),
		publishAsync: promisify(redis.set.bind(redis)),
		subscribeAsync: promisify(redis.subscribe.bind(this)),
		geoAddAsync: promisify(redis.geoadd.bind(this)),
		geoRadiusAsync: promisify(redis.georadius.bind(this)),
		geoDistAsync: promisify(redis.geodist.bind(this)),
		geoRadiusByMemberAsync: promisify(redis.georadiusbymember.bind(this)),
		geoPosAsync: promisify(redis.geopos.bind(this)),
	};
	return {
		redis,
		redisAsync,
	};
};
const { cacheClient, cacheClientAsync } = getClient(REDIS_CACHE_CONFIG);
const { redisPub, redisPubAsync } = getClient(REDIS_QUEUE_CONFIG);
const { redisSub, redisSubAsync } = getClient(REDIS_QUEUE_CONFIG);
const { redis, redisAsync } = getClient(REDIS_CONFIG);
// const getAsync = promisify(redis.get.bind(redis));
// const setAsync = promisify(redis.set.bind(redis));
// const publishAsync = promisify(redis.publish.bind(this));
// const subscribeAsync = promisify(redis.subscribe.bind(this));
// const geoAddAsync = promisify(redis.geoadd.bind(this));

// const geoRadiusAsync = promisify(redis.georadius.bind(this));
// const geoDistAsync = promisify(redis.geodist.bind(this));
// const geoRadiusByMemberAsync = promisify(redis.georadiusbymember.bind(this));
// const geoPosAsync = promisify(redis.geopos.bind(this));

module.exports = {
	cacheClient,
	cacheClientAsync,
	redisPub,
	redisPubAsync,
	redisSub,
	redisSubAsync,
	redis,
	redisAsync,
};
