const TypeValidator = require('../../utils/typeValidator.js');

const schemas = {
	v1: require('../config/userSchema.v1.json'),
	// add future schemas here
};

class User {
	constructor(version = 'v1') {
		this.version = version;
		this.schema = schemas[version];
	}

	static getSchema(version = 'v1') {
		const schema = schemas[version];
		if (!schema) {
			const supported = Object.keys(schemas).join(', ');
			throw new Error(
				`Schema version "${version}" not found. Supported versions: ${supported}`
			);
		}
		return schema;
	}

	static createUser(props = {}, version = 'v1') {
		const schema = this.getSchema(version);
		const user = {};
		for (const key of Object.values(schema)) {
			user[key] = props[key] ?? null;
		}
		return user;
	}

	static createGenericUser(version = 'v1') {
		const schema = this.getSchema(version);
		const randomId = Math.floor(Math.random() * 1_000_000);

		switch (version) {
			case 'v1':
				return {
					[schema.USERNAME]: `user${randomId}`,
					[schema.EMAIL]: `user${randomId}@example.com`,
					[schema.PASSWORD]: `password${randomId}`,
				};
			default:
				throw new Error(`No mock user factory for schema version: ${version}`);
		}
	}

	static generateGenericUsers(count, version = 'v1') {
		const users = [];
		for (let i = 0; i < count; i++) {
			users.push(this.createGenericUser(version));
		}
		return users;
	}

	static validate(actual, expected, version = 'v1') {
		const schema = this.getSchema(version);

		switch (version) {
			case 'v1':
				this.#validateTypesV1(actual, schema);
				this.#validateValuesV1(actual, expected, schema);
				break;
			default:
				throw new Error(
					`No validation rules defined for schema version: ${version}`
				);
		}
	}

	static #validateTypesV1(actual, schema) {
		if (!TypeValidator.isNumber(actual[schema.ID])) {
			throw new Error(`Invalid ID: ${actual[schema.ID]}`);
		}

		for (const key of [schema.USERNAME, schema.EMAIL, schema.PASSWORD]) {
			if (!TypeValidator.isString(actual[key])) {
				throw new Error(`Invalid ${key}: ${actual[key]}`);
			}
		}

		if (!TypeValidator.isValidEmail(actual[schema.EMAIL])) {
			throw new Error(`Invalid email format: ${actual[schema.EMAIL]}`);
		}
	}

	static #validateValuesV1(actual, expected, schema) {
		if (actual[schema.USERNAME] !== expected[schema.USERNAME]) {
			throw new Error(
				`Username mismatch. Expected: ${expected[schema.USERNAME]}, Actual: ${
					actual[schema.USERNAME]
				}`
			);
		}

		if (actual[schema.EMAIL] !== expected[schema.EMAIL]) {
			throw new Error(
				`Email mismatch. Expected: ${expected[schema.EMAIL]}, Actual: ${
					actual[schema.EMAIL]
				}`
			);
		}

		if (actual[schema.PASSWORD] !== expected[schema.PASSWORD]) {
			throw new Error(`Password mismatch.`);
		}
	}
}

// Dynamically add default schema fields as static properties for convenience in tests
const defaultVersion = 'v1';
const defaultSchema = schemas[defaultVersion];
for (const [key, value] of Object.entries(defaultSchema)) {
	User[key] = value;
}

module.exports = User;
