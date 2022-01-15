const { IP_ADDR } = require('./network');
const {
	NEO4J_ENDPOINT = `neo4j://${IP_ADDR}:7687`,
	NEO4J_USERNAME = 'neo4j',
	NEO4J_PASSWORD = 'Neo4jPassword123?',
} = process.env;

module.exports = {
	NEO4J_ENDPOINT,
	NEO4J_USERNAME,
	NEO4J_PASSWORD,
};
