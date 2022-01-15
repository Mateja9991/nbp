const fs = require('fs');
const { mainSession } = require('..');

class BaseRepository {
	/**
	 *
	 * @param {string} modelName
	 * @param {{cache?:boolean,searchTermProp:string}|undefined} options
	 */
	constructor(modelLabels, options = {}) {
		this.labels = modelLabels;
		this.options = options;
	}
	async getAll(options = {}) {
		const getOptions = this.cacheGetOptions();
		return mainSession.run(
			`MATCH (obj${this.labels.reduce(
				(acc, label) => acc + `:${label}`,
				''
			)}) return obj`,
			{
				...getOptions,
				...options,
			}
		);
	}

	async getPaginated(
		{ skip = 0, limit = 15, queryBody, orderBy, orderDir = 'ASC', searchTerm },
		options = {}
	) {
		const { searchTermProp } = this.options;
		const getOptions = this.cacheGetOptions();
		const objectQuery = queryBody ? this.stringify(queryBody) : '';
		const orderQuery = orderBy
			? `ORDER BY obj.${orderBy} ${
					orderDir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'
			  }`
			: '';
		let likeQuery = '';
		if (searchTermProp) {
			likeQuery = searchTerm
				? `WHERE toLower(toString(obj.${searchTermProp})) =~ '.*${searchTerm.toLowerCase()}.*'`
				: '';
		}

		return mainSession.runOne(
			`MATCH (obj${this.labels.reduce(
				(acc, label) => acc + `:${label}`,
				''
			)} ${objectQuery}) ${likeQuery}
    WITH count(*) AS cnt
    MATCH 
    (obj${this.labels.reduce(
			(acc, label) => acc + `:${label}`,
			''
		)} ${objectQuery}) ${likeQuery}
    WITH obj, cnt ${orderQuery} SKIP ${skip} LIMIT ${limit}
    RETURN 
    { data:collect(obj), total: cnt, limit: ${limit}, skip: ${skip} } AS objects`,
			{
				...getOptions,
				...options,
			}
		);
	}

	async getById(id) {
		const getOptions = this.cacheGetOptions();
		return mainSession.runOne(
			`MATCH (obj ${this.labels.reduce(
				(acc, label) => acc + `:${label}`,
				''
			)}) WHERE ID(obj) = ${id} return obj`,
			getOptions
		);
	}

	async update(id, body) {
		const removeOptions = this.cacheRemoveOptions();
		return mainSession.runOne(
			`MATCH (obj ${this.labels.reduce(
				(acc, label) => acc + `:${label}`,
				''
			)}) WHERE ID(obj) = ${id} SET obj += ${this.stringify(body)} return obj`,
			removeOptions
		);
	}

	async create(body) {
		const removeOptions = this.cacheRemoveOptions();
		return mainSession.runOne(
			`CREATE (obj ${this.labels.reduce(
				(acc, label) => acc + `:${label}`,
				''
			)} ${this.stringify(body)}) return obj`,
			removeOptions
		);
	}

	async createMany(bodies) {
		const removeOptions = this.cacheRemoveOptions();
		const query = bodies
			.map(
				(body, index) =>
					`(obj${index}: ${this.labels.reduce(
						(acc, label) => acc + `:${label}`,
						''
					)} ${this.stringify(body)})`
			)
			.join(', ');
		return mainSession.run(`CREATE ${query}`, removeOptions);
	}

	async deleteById(id) {
		const removeOptions = this.cacheRemoveOptions();

		await mainSession.runOne(
			`MATCH (obj ${this.labels.reduce(
				(acc, label) => acc + `:${label}`,
				''
			)}) WHERE ID(obj) = ${id}
				DETACH DELETE obj`,
			removeOptions
		);

		return {
			id,
		};
	}

	cacheGetOptions() {
		const { cache } = this.options;
		return cache
			? { cacheKey: this.labels.reduce((acc, label) => acc + `:${label}`, '') }
			: {};
	}

	cacheRemoveOptions() {
		const { cache } = this.options;
		return cache
			? {
					removeCacheKey: this.labels.reduce(
						(acc, label) => acc + `:${label}`,
						''
					),
			  }
			: {};
	}

	stringify(data) {
		switch (typeof data) {
			case 'string':
				try {
					const jsonData = JSON.parse(data);
					return this.stringify(jsonData);
				} catch (err) {
					return `"${data.replace(/["\\]/g, (char) => `\\${char}`)}"`;
				}
			case 'object': {
				if (Array.isArray(data)) {
					let body = '[';
					const arrayData = data.map((arrayValue) =>
						this.stringify(arrayValue)
					);
					body += arrayData.join(',');
					body += ']';
					return body;
				}
				let body = '{';
				const objectData = [];
				Object.entries(data).forEach(([key, value]) => {
					const objectValue = this.stringify(value);
					if (objectValue !== undefined) {
						objectData.push(`${key}:${objectValue}`);
					}
				});
				body += objectData.join(',');
				body += '}';
				return body;
			}
			default:
				return data;
		}
	}

	async removeFile(imageUrl) {
		const imageRelativePath = imageUrl.replace(process.env.HOST, '.');
		return new Promise((resolve) =>
			fs.unlink(imageRelativePath, (err) => {
				if (err) {
					console.error(`Failed removing file: ${imageUrl}`);
					return resolve(false);
				}
				return resolve(true);
			})
		);
	}
}
const BaseRepositoryInstance = new BaseRepository([]);
module.exports = {
	BaseRepository,
	BaseRepositoryInstance,
};
