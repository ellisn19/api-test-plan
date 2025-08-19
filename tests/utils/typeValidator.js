class TypeValidator {
	static isNumber(value) {
		if (!value) return false;
		return typeof value === 'number' && !isNaN(value);
	}

	static isString(value) {
		if (!value) return false;
		return typeof value === 'string';
	}

	static isValidEmail(email) {
		if (!email || !this.isString(email)) return false;

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}
}

module.exports = TypeValidator;
