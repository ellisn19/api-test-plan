module.exports = {
	testEnvironment: 'node',
	verbose: true,
	coverageDirectory: 'coverage',
	collectCoverageFrom: ['tests/**/*.js'],
	testMatch: ['**/tests/**/*.test.js'],
	bail: 1, // Stop after first test failure
};
