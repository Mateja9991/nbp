const neo4j = require('neo4j-driver');
const {
	NEO4J_ENDPOINT,
	NEO4J_USERNAME,
	NEO4J_PASSWORD,
} = require('../../constants/neo4j.config');

const driver = neo4j.driver(url, neo4j.auth.basic(user, password));

module.exports = {
	driver,
};

//const stringify = require('util').inspect;

// const session = driver.session(); kad treba sessija
// (async () => {
// 	try {
// const personName = '.*Atlas.*';

// 		// const result = await session.run('CREATE (a:Person {name: $name}) RETURN a', {
// 		// name: personName,
// 		// });
// 		console.log('pre');
// 		const result = await session.run(
// 			'MATCH (n)<-[r:ACTED_IN]-(a) WHERE EXISTS(n.title) and n.title =~ $name RETURN a',
// 			{
// 				name: personName,
// 			}
// 		);
// 		console.log('posle');

// 		const singleRecord = result.records[0];
// 		result.records
// 			.map((singleRecord) => singleRecord.get(0))
// 			.forEach((node) => {
// 				console.log(node.properties.name);
// 			});
// 		const person = {
// 			name: 'Alice',
// 		};
// 		// const node = singleRecord.get(0);
// 		const result2 = await session.run(
// 			`CREATE (a:Person ${stringify(person)}) RETURN a`
// 		);

// 		const singleRecord2 = result2.records[0];
// 		const node2 = singleRecord2.get(0);

// 		console.log(node2.properties.name);
// 		// console.log(node.properties.name);

// 		await driver.close();
// 		console.log('neo4j done');
// 	} finally {
// 		await session.close();
// 	}
// })();
// on application exit:
