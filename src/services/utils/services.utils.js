function destructureArray(arrayToDestructure, arrayofProperties) {
	const arr = [];
	arrayToDestructure.forEach((obj) => {
		arr.push(destructureObject(obj, arrayofProperties));
	});
	return arr;
}
function destructureObject(objectToDestructure, arrayofProperties) {
	const object = {};

	arrayofProperties.forEach((field) => {
		object[field] = objectToDestructure[field];
	});
	return object;
}

module.exports = {
	destructureObject,
};
