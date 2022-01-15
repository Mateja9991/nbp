const { promisify } = require('util');
const Redis = require('ioredis');
const {
	REDIS_CONFIG,
	REDIS_CACHE_CONFIG,
	REDIS_QUEUE_CONFIG,
	REDIS_CHAT_CONFIG,
	REDIS_HOST,
	REDIS_PORT,
	REDIS_PASSWORD,
	REDIS_DB,
} = require('../../constants/redis.config');

const getClient = (CONFIG) => {
	const redis = new Redis(CONFIG);
	const redisAsync = {
		getAsync: promisify(redis.get.bind(redis)),
		setAsync: promisify(redis.set.bind(redis)),
		publishAsync: promisify(redis.set.bind(redis)),
		subscribeAsync: promisify(redis.subscribe.bind(redis)),
		geoAddAsync: promisify(redis.geoadd.bind(redis)),
		geoRadiusAsync: promisify(redis.georadius.bind(redis)),
		geoDistAsync: promisify(redis.geodist.bind(redis)),
		geoRadiusByMemberAsync: promisify(redis.georadiusbymember.bind(redis)),
		geoPosAsync: promisify(redis.geopos.bind(redis)),
		execAsync: promisify(redis.exec.bind(redis)),
		rpushAsync: promisify(redis.rpush.bind(redis)),
		lpopAsync: promisify(redis.lpop.bind(redis)),
		rpopAsync: promisify(redis.rpop.bind(redis)),
		lpushAsync: promisify(redis.lpush.bind(redis)),
		rpushAsync: promisify(redis.rpush.bind(redis)),
		lrangeAsync: promisify(redis.lrange.bind(redis)),
		lremAsync: promisify(redis.lrem.bind(redis)),
		zrangeAsync: promisify(redis.zrange.bind(redis)),
		zremAsync: promisify(redis.zrem.bind(redis)),
		flushallAsync: async () => {
			const flushAsync = promisify(redis.flushall.bind(redis));
			const keypress = async () => {
				process.stdin.setRawMode(true);
				return new Promise((resolve) =>
					process.stdin.once('data', (data) => {
						process.stdin.setRawMode(false);
						resolve(data.toString());
					})
				);
			};
			console.log('Drop every redis DB? [y/*]');
			return keypress()
				.then((char) => {
					if (char === 'y') {
						console.log('said YES!!');
					} else {
						console.log('said NO!!');
					}
				})
				.catch((err) => console.log(err));
		},
	};
	redis.on('connect', () => {
		console.log(`Connected with ${CONFIG.db}`);
	});
	return {
		redis,
		redisAsync,
	};
};
const { redis: cacheClient, redisAsync: cacheClientAsync } =
	getClient(REDIS_CACHE_CONFIG);

const { redis: redisPub, redisAsync: redisPubAsync } =
	getClient(REDIS_QUEUE_CONFIG);
const { redis: redisSub, redisAsync: redisSubAsync } =
	getClient(REDIS_QUEUE_CONFIG);

const { redis: redisChat, redisAsync: redisChatAsync } =
	getClient(REDIS_CHAT_CONFIG);

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
	redisChat,
	redisChatAsync,
};
