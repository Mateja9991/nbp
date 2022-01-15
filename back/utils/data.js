const { redisAsync } = require('../src/db');
const 
const dropDB = async () => {
	await redisAsync.flushallAsync();

};

dropDB();
