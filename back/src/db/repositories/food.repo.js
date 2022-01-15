const { mainSession } = require('..');
const { BaseRepository } = require('./base.repo');

class FoodRepository extends BaseRepository {}

module.exports = new FoodRepository(['Food'], {
	cache: true,
});
