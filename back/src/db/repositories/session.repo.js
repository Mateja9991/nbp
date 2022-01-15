const { mainSession } = require('..');
const { BaseRepository } = require('./base.repo');
const { UserRepository } = require('./user.repo');

class SessionRepository extends UserRepository {
	async create(participants) {}
}

module.exports = new SessionRepository(['Session'], {
	cache: true,
});
