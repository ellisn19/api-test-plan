const User = require('./userFactory.js');
const TypeValidator = require('../../utils/typeValidator.js');

const { ID, USERNAME, EMAIL, PASSWORD } = User;

describe('userFactory', () => {
	it('should have expected field constants', async () => {
		expect({ ID, USERNAME, EMAIL, PASSWORD }).toEqual({
			ID: 'id',
			USERNAME: 'username',
			PASSWORD: 'password',
			EMAIL: 'email',
		});
	});

	it('should create a generic user with consistent and valid fields', () => {
		const newUser = User.createGenericUser();

		expect(newUser).toHaveProperty(USERNAME);
		expect(newUser).toHaveProperty(EMAIL);
		expect(newUser).toHaveProperty(PASSWORD);

		const match = newUser[USERNAME].match(/^user(\d+)$/);
		expect(match).not.toBeNull();
		const randomId = match[1];

		expect(newUser[EMAIL]).toBe(`user${randomId}@example.com`);
		expect(newUser[PASSWORD]).toBe(`password${randomId}`);
		expect(TypeValidator.isValidEmail(newUser[EMAIL]));

		// Ensure multiple calls produce different users
		const anotherUser = User.createGenericUser();
		expect(anotherUser).not.toEqual(newUser);
	});

	it('should generate 100 generic users with consistent and valid fields', () => {
		const count = 100;
		const newUsers = User.generateGenericUsers(count);

		expect(newUsers.length).toBe(count);

		const usernames = new Set();
		const emails = new Set();
		const passwords = new Set();

		for (const user of newUsers) {
			const username = user[USERNAME];
			const email = user[EMAIL];
			const password = user[PASSWORD];

			expect(username).toMatch(/^user\d+$/);
			const randomId = username.replace('user', '');

			expect(email).toBe(`user${randomId}@example.com`);
			expect(TypeValidator.isValidEmail(email));
			expect(password).toBe(`password${randomId}`);

			usernames.add(username);
			emails.add(email);
			passwords.add(password);
		}

		expect(usernames.size).toBe(count);
		expect(emails.size).toBe(count);
		expect(passwords.size).toBe(count);
	});

	describe('Validate users', () => {
		let expected;
		let actual;
		beforeEach(() => {
			const properties = {
				[USERNAME]: 'username',
				[EMAIL]: 'email@email.com',
				[PASSWORD]: 'password',
			};
			expected = User.createUser(properties);
			actual = User.createUser(properties);
			actual[ID] = Math.floor(Math.random() * 1_000_000);
		});

		it('should validate two users', () => {
			expect(() => {
				User.validate(actual, expected);
			}).not.toThrow();
		});

		it('should throw error on mismatch username values', () => {
			actual[USERNAME] = 'notUsername';

			expect(() => {
				User.validate(actual, expected);
			}).toThrow(
				`Username mismatch. Expected: ${expected[USERNAME]}, Actual: ${actual[USERNAME]}`
			);
		});

		it('should throw error on mismatch email values', () => {
			actual[EMAIL] = 'notemail@email.com';

			expect(() => {
				User.validate(actual, expected);
			}).toThrow(
				`Email mismatch. Expected: ${expected[EMAIL]}, Actual: ${actual[EMAIL]}`
			);
		});

		it('should throw error on mismatch password values', () => {
			actual[PASSWORD] = 'notPassword';

			expect(() => {
				User.validate(actual, expected);
			}).toThrow(`Password mismatch.`);
		});

		it('should throw error on mismatch username types', () => {
			actual[USERNAME] = 'notUsername';

			expect(() => {
				User.validate(actual, expected);
			}).toThrow(
				`Username mismatch. Expected: ${expected[USERNAME]}, Actual: ${actual[USERNAME]}`
			);
		});

		it('should throw error on mismatch email types', () => {
			actual[EMAIL] = 12312;

			expect(() => {
				User.validate(actual, expected);
			}).toThrow(`Invalid email: ${actual[EMAIL]}`);

			actual[EMAIL] = '12313';
			expect(() => {
				User.validate(actual, expected);
			}).toThrow(`Invalid email format: ${actual[EMAIL]}`);

			actual[EMAIL] = '.com@test';
			expect(() => {
				User.validate(actual, expected);
			}).toThrow(`Invalid email format: ${actual[EMAIL]}`);
		});

		it('should throw error on mismatch password types', () => {
			actual[PASSWORD] = 123;

			expect(() => {
				User.validate(actual, expected);
			}).toThrow(`Invalid ${PASSWORD}: ${actual[PASSWORD]}`);
		});
	});
});
