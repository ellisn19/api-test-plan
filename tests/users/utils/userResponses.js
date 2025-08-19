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

function mockPostUserError(message = 'Error message for testing purposes') {
	return {
		status: 400,
		statusText: 'Bad Request',
		data: { error: message },
	};
}

module.exports = {
	mockPostUserSuccess,
	mockPostUserError,
};
