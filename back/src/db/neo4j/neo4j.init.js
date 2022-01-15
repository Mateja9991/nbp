const neo4j = require('neo4j-driver');
const {
	NEO4J_ENDPOINT,
	NEO4J_USERNAME,
	NEO4J_PASSWORD,
} = require('../../constants/neo4j.config');

const neoDriver = neo4j.driver(
	NEO4J_ENDPOINT,
	neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD)
);

module.exports = {
	neoDriver,
};
