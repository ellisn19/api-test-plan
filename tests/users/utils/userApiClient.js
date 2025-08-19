const axios = require('axios');

class UserApiClient {
	constructor(baseUrl) {
		this.baseUrl = baseUrl;
	}

	async postUser(user) {
		return axios
			.post(`${this.baseUrl}`, user, {
				headers: { 'Content-Type': 'application/json' },
			})
			.then((response) => {
				return response;
			})
			.catch((error) => {
				if (error.response) {
					return error.response;
				} else {
					throw new Error(`Network error: ${error.message}`);
				}
			});
	}
}

module.exports = UserApiClient;
