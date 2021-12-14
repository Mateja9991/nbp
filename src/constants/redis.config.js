const redisConfig = {
	port: 6379,
	host: '192.168.164.251',
	family: 4, // 4 (IPv4) or 6 (IPv6)
	password: 'RedisPassword123?',
	db: 0,
};

module.exports = {
	...redisConfig,
};
