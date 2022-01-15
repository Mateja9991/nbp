const jwt = require('jsonwebtoken');
const { mainSession } = require('..');
const { BaseRepository } = require('./base.repo');
const { hashString, hashCheck } = require('../../common/hashing');
const { USER_ROLES } = require('../../constants/user_roles');

class UserRepository extends BaseRepository {
	async update(id, body) {
		const { username, password, ...filtered } = body;
		if (password) {
			const hashedPassword = await this.getHashPassword(password);
			filtered.password = hashedPassword;
		}
		const removeOptions = this.cacheRemoveOptions();
		return mainSession
			.runOne(
				`MATCH (obj ${this.labels.reduce(
					(acc, label) => acc + `:${label}`,
					''
				)}) WHERE ID(obj) = ${id} SET obj += ${this.stringify(
					filtered
				)} return obj`,
				removeOptions
			)
			.then((user) => this.userWithoutPassword(user));
	}

	async getById(id) {
		const getOptions = this.cacheGetOptions();
		return mainSession
			.runOne(
				`MATCH (obj ${this.labels.reduce(
					(acc, label) => acc + `:${label}`,
					''
				)}) WHERE ID(obj) = ${id} return obj`,
				getOptions
			)
			.then((user) => this.userWithoutPassword(user));
	}

	async getUser(searchBody, getPassword = false) {
		return mainSession
			.runOne(`MATCH (user:User ${this.stringify(searchBody)}) RETURN user`, {
				cacheKey: this.labels.reduce((acc, label) => acc + `:${label}`, ''),
			})
			.then((user) => (getPassword ? user : this.userWithoutPassword(user)));
	}

	async getAll(queryOptions) {
		return this.getPaginated(queryOptions).then((response) => ({
			...response,
			data:
				response && response.data
					? response.data.map((user) => this.userWithoutPassword(user))
					: [],
		}));
	}

	async register(body = {}) {
		const { username, password } = body;
		let user = await this.getUser({ username });
		if (user) {
			throw new Error('Username already in use');
		}
		const hashPassword = await this.getHashPassword(password);
		const userBody = {
			...body,
			username,
			password: hashPassword,
			//treba da se role veze za body, tako da se onda linija ispod brise
			//roles: [USER_ROLES.CUSTOMER],
		};
		user = this.userWithoutPassword(await this.create(userBody));
		const payload = { id: user.id };

		const token = jwt.sign(payload, process.env.JWT_SECRET, {
			expiresIn: '7d',
		});
		return { user, token };
	}

	async login(username, password) {
		const user = await this.getUser({ username }, true);
		if (user) {
			const result = await hashCheck(user.password, password);
			if (result) {
				const payload = { id: user.id };
				const token = jwt.sign(payload, process.env.JWT_SECRET, {
					expiresIn: '7d',
				});
				return { user: this.userWithoutPassword(user), token };
			}
		}
		throw new Error('Invalid username or password');
	}

	async getUserRole(userId) {
		return mainSession.runOne(
			`MATCH (n:User) WHERE ID(n)=${userId} RETURN distinct labels(n)`,
			{
				cacheKey: this.labels.reduce((acc, label) => acc + `:${label}`, ''),
			}
		);
	}
	userWithoutPassword(user) {
		if (!user) {
			return user;
		}
		const { password, ...filtered } = user;
		return filtered;
	}

	async getHashPassword(password) {
		return hashString(password);
	}
}

const UserRepositoryInstance = new UserRepository(['User'], {
	cache: true,
});

module.exports = {
	UserRepository,
	UserRepositoryInstance,
};
