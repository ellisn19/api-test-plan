const axios = require('axios');
const endpoints = require('./config/endpoints.json');

const {
	mockPostUserSuccess,
	buildMockError,
} = require('./utils/userResponses.js');

const User = require('./utils/userFactory.js');
const UserApiClient = require('./utils/userApiClient.js');
const TypeValidator = require('../utils/typeValidator.js');

jest.mock('axios');

describe('addUser v1', () => {
	const userApiClient = new UserApiClient(endpoints.usersBaseUrl.v1);
	const { ID, USERNAME, EMAIL, PASSWORD } = User.getSchema('v1');

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('Functional', () => {
		it('should return expected schema on success', async () => {
			const newUser = User.createGenericUser();
			const mockResponse = mockPostUserSuccess(newUser);

			axios.post.mockResolvedValue(mockResponse);

			const response = await userApiClient.postUser(newUser);

			expect(response).toHaveProperty('status');
			expect(response).toHaveProperty('statusText');
			expect(response).toHaveProperty('data');
			expect(Object.keys(response.data).length).toBe(4);
			expect(response.data).toHaveProperty(ID);
			expect(response.data).toHaveProperty(USERNAME);
			expect(response.data).toHaveProperty(PASSWORD);
			expect(response.data).toHaveProperty(EMAIL);
		});

		it('should return expected schema on error', async () => {
			const newUser = User.createGenericUser();
			const mockResponse = buildMockError(400);

			axios.post.mockResolvedValue(mockResponse);

			const response = await userApiClient.postUser(newUser);

			expect(response).toHaveProperty('status');
			expect(response).toHaveProperty('statusText');
			expect(response).toHaveProperty('data');
			expect(Object.keys(response.data).length).toBe(1);
			expect(response.data).toHaveProperty('error');
		});

		it('should succeed when addition property is passed', async () => {
			const newUser = User.createGenericUser();
			newUser['extraProperty'] = 'extraValue';

			const mockResponse = mockPostUserSuccess(newUser);

			axios.post.mockResolvedValue(mockResponse);

			const response = await userApiClient.postUser(newUser);

			expect(response.status).toBe(201);
			expect(response.statusText).toBe('Created');
			expect(Object.keys(response.data).length).toBe(4);

			User.validate(response.data, newUser);
		});

		it('should handle additional/unexpected fields from server', async () => {
			const newUser = User.createGenericUser();
			const mockResponse = mockPostUserSuccess(newUser);
			mockResponse.data.extraProperty = 'extraValue';

			axios.post.mockResolvedValue(mockResponse);

			const response = await userApiClient.postUser(newUser);

			expect(response.status).toBe(201);
			expect(response.statusText).toBe('Created');
			expect(Object.keys(response.data).length).toBe(5);

			User.validate(response.data, newUser);
		});

		it('should return correct user data', async () => {
			const newUser = User.createGenericUser();
			const mockResponse = mockPostUserSuccess(newUser);

			axios.post.mockResolvedValue(mockResponse);

			const response = await userApiClient.postUser(newUser);

			expect(response.status).toBe(201);
			expect(response.statusText).toBe('Created');

			User.validate(response.data, newUser);
		});
	});

	describe('Negative', () => {
		describe('Missing required properties in payload', () => {
			const requiredProperties = [USERNAME, EMAIL, PASSWORD];

			requiredProperties.forEach((property) => {
				it(`should fail when ${property} property is missing`, async () => {
					const newUser = User.createGenericUser();
					delete newUser[property];

					const mockResponse = buildMockError(400);

					axios.post.mockResolvedValue(mockResponse);

					const response = await userApiClient.postUser(newUser);

					expect(response.status).toBe(400);
					expect(typeof response.data.error === 'string').toBe(true);
				});
			});
		});

		describe('Invalid property values', () => {
			const testCases = [
				{ prop: 'username', value: null },
				{ prop: 'username', value: '' },
				{ prop: 'email', value: null },
				{ prop: 'email', value: '' },
				{ prop: 'email', value: 'johnAtExampleDotCom' },
				{ prop: 'password', value: null },
				{ prop: 'password', value: '' },
				{
					prop: 'all properties null',
					value: { username: null, email: null, password: null },
				},
				{
					prop: 'all properties empty',
					value: { username: '', email: '', password: '' },
				},
			];

			testCases.forEach(({ prop, value }) => {
				it(`should fail when ${prop} is ${value}`, async () => {
					const userProps = prop.startsWith('all properties')
						? value
						: { [prop]: value };
					const newUser = User.createUser(userProps);
					const mockResponse = buildMockError(400);

					axios.post.mockResolvedValue(mockResponse);

					const response = await userApiClient.postUser(newUser);

					expect(response.status).toBe(400);
					expect(typeof response.data.error === 'string').toBe(true);
				});
			});
		});
	});

	describe('Error handling', () => {
		describe('Server errors', () => {
			const statusCodes = [500, 502, 503];

			statusCodes.forEach((statusCode) => {
				it(`should handle ${statusCode} internal server error`, async () => {
					const newUser = User.createGenericUser();
					const mockResponse = buildMockError(statusCode);

					axios.post.mockResolvedValue(mockResponse);

					const response = await userApiClient.postUser(newUser);
					expect(response.status).toBe(statusCode);
					expect(TypeValidator.isString(response.statusText)).toBeTruthy();
					expect(response.data.error).toBe('Server error');
				});
			});
		});
		describe('Client errors', () => {
			const statusCodes = [400, 401, 403, 404];

			statusCodes.forEach((statusCode) => {
				it(`should handle ${statusCode} client error`, async () => {
					const newUser = User.createGenericUser();
					const mockResponse = buildMockError(statusCode);

					axios.post.mockResolvedValue(mockResponse);

					const response = await userApiClient.postUser(newUser);
					expect(response.status).toBe(statusCode);
					expect(TypeValidator.isString(response.statusText)).toBeTruthy();
					expect(TypeValidator.isString(response.data.error)).toBeTruthy();
				});
			});
		});
	});

	describe('Performance', () => {
		it('should handle 100 parallel user creations quickly', async () => {
			const usersToCreate = 100;
			const newUsers = Array.from({ length: usersToCreate }, () =>
				User.createGenericUser()
			);

			const start = Date.now();
			await Promise.all(newUsers.map((u) => userApiClient.postUser(u)));
			const elapsed = Date.now() - start;

			expect(elapsed).toBeLessThan(200);
		});

		it('should handle 1000 concurrent requests', async () => {
			const usersToCreate = 1000;
			const mockUser = User.createGenericUser();
			const mockResponse = mockPostUserSuccess(mockUser);

			axios.post.mockResolvedValue(mockResponse);

			const requests = Array.from({ length: usersToCreate }, () =>
				userApiClient.postUser(mockUser)
			);

			const results = await Promise.all(requests);
			results.forEach((res) => expect(res.status).toBe(201));
		});

		it('should handle large payloads efficiently', async () => {
			const largeUser = User.createUser({
				[USERNAME]: 'a'.repeat(10000),
				[EMAIL]: 'longemail'.repeat(5000) + '@example.com',
				[PASSWORD]: 'p'.repeat(10000),
			});
			const mockResponse = mockPostUserSuccess(largeUser);

			axios.post.mockResolvedValue(mockResponse);

			const response = await userApiClient.postUser(largeUser);

			expect(response.status).toBe(201);
			expect(response.data[USERNAME].length).toBe(10000);
			expect(response.data[EMAIL]).toMatch(/^longemail/);
			expect(response.data[PASSWORD].length).toBe(10000);
			User.validate(response.data, largeUser);
		});
	});
});
