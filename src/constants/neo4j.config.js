const neo4jConfig = {
	user: 'neo4j',
	password: 'Neo4jPassword123?',
	url: 'neo4j://192.168.164.251:7687',
};
const {
	NEO4J_ENDPOINT = 'neo4j://192.168.164.251:7687',
	NEO4J_USERNAME = 'neo4j',
	NEO4J_PASSWORD = 'Neo4jPassword123?',
} = process.env;

module.exports = {
	NEO4J_ENDPOINT,
	NEO4J_USERNAME,
	NEO4J_PASSWORD,
};
