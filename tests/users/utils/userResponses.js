const User = require('../utils/userFactory');

function mockPostUserSuccess(user) {
	return {
		status: 201,
		statusText: 'Created',
		data: {
			[User.FIELDS.ID]: Math.floor(Math.random() * 1_000_000),
			[User.FIELDS.USERNAME]: user[User.FIELDS.USERNAME],
			[User.FIELDS.EMAIL]: user[User.FIELDS.EMAIL],
			[User.FIELDS.PASSWORD]: user[User.FIELDS.PASSWORD],
		},
	};
}

function buildMockError(status, message) {
	if (status >= 400 && status < 500) return mockClientError(status, message);
	if (status >= 500 && status < 600) return mockServerError(status, message);
	throw new Error('Unsupported status code for mockError');
}

function mockClientError(status, message) {
	const defaults = {
		400: { statusText: 'Bad Request', data: { error: 'Invalid request' } },
		401: {
			statusText: 'Unauthorized',
			data: { error: 'Authentication required' },
		},
		403: { statusText: 'Forbidden', data: { error: 'Access denied' } },
		404: { statusText: 'Not Found', data: { error: 'Resource not found' } },
	};
	return buildError(status, defaults, message);
}

function mockServerError(status, message) {
	const defaults = {
		500: {
			statusText: 'Internal Server Error',
			data: { error: 'Server error' },
		},
		502: { statusText: 'Bad Gateway', data: { error: 'Server error' } },
		503: { statusText: 'Service Unavailable', data: { error: 'Server error' } },
	};
	return buildError(status, defaults, message);
}

function buildError(status, defaults, customMessage) {
	return {
		status,
		statusText: defaults[status]?.statusText || 'Unknown Error',
		data: {
			error: customMessage || defaults[status]?.data?.error || 'Unknown error',
		},
	};
}

module.exports = {
	mockPostUserSuccess,
	buildMockError,
};
