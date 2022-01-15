const dotenv = require('dotenv');
const fs = require('fs');

function initializeEnvironment() {
	dotenv.config();
	if (fs.existsSync(__dirname + '/../.env')) {
		const envConfig = dotenv.parse(fs.readFileSync(__dirname + '/../.env'));
		Object.keys(envConfig).forEach((key) => {
			process.env[key] = envConfig[key];
		});
	}
}

module.exports = {
	initializeEnvironment,
};
