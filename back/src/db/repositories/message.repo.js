const { mainSession } = require('..');
const { BaseRepository } = require('./base.repo');
const { UserRepository } = require('./user.repo');

class MessageRepository extends BaseRepository {}

module.exports = new CarrierRepository(['Message'], {
	cache: true,
});
