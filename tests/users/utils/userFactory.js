const TypeValidator = require('../../utils/typeValidator.js');

class User {
	static ID = 'id';
	static USERNAME = 'username';
	static EMAIL = 'email';
	static PASSWORD = 'password';

	static createUser(props = {}) {
		const user = new User();
		Object.assign(user, props);
		return user;
	}

	static createGenericUser() {
		const randomId = Math.floor(Math.random() * 1_000_000);
		return {
			[User.USERNAME]: `user${randomId}`,
			[User.EMAIL]: `user${randomId}@example.com`,
			[User.PASSWORD]: `password${randomId}`,
		};
	}

	static generateGenericUsers(count) {
		const users = [];
		for (let i = 0; i < count; i++) {
			const user = this.createGenericUser();
			users.push(user);
		}
		return users;
	}

	static validate(actual, expected) {
		this.#validateTypes(actual);
		this.#validateValues(actual, expected);
	}

	static #validateTypes(actual) {
		if (!TypeValidator.isNumber(actual[User.ID])) {
			throw new Error(`Invalid ID: ${actual[User.ID]}`);
		}
		for (const key of [User.USERNAME, User.EMAIL, User.PASSWORD]) {
			if (!TypeValidator.isString(actual[key])) {
				throw new Error(`Invalid ${key}: ${actual[key]}`);
			}
		}
		if (!TypeValidator.isValidEmail(actual[User.EMAIL])) {
			throw new Error(`Invalid email format: ${actual[User.EMAIL]}`);
		}
	}

	static #validateValues(actual, expected) {
		if (actual[User.USERNAME] !== expected[User.USERNAME]) {
			throw new Error(
				`Username mismatch. Expected: ${expected[User.USERNAME]}, Actual: ${
					actual[User.USERNAME]
				}`
			);
		}
		if (actual[User.EMAIL] !== expected[User.EMAIL]) {
			throw new Error(
				`Email mismatch. Expected: ${expected[User.EMAIL]}, Actual: ${
					actual[User.EMAIL]
				}`
			);
		}
		if (actual[User.PASSWORD] !== expected[User.PASSWORD]) {
			throw new Error(`Password mismatch.`);
		}
	}
}

module.exports = User;
