# Fake Store API - Users Enpoint Test Plan

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Jest](https://img.shields.io/badge/jest-30.0.5-brightgreen)
![Axios](https://img.shields.io/badge/axios-1.5.0-blue)

## Overview

This test plan validates the Fake Store API Users endpoints for functional correctness, performance, and reliability across all CRUD operations.

## Scope

Endpoints covered:

- **POST** `/users`
- **POST** `/users`
- **POST** `/users/:id`
- **POST** `/users/:id`
- **DELETE** `/users/:id`

## Test Strategy

The following types of testing are applied:

- **Functional**: Validate expected success paths for each endpoint
- **Negative**: Missing or invalid fields, invalid IDs, empty requests
- **Contract**: Verify schema matches expected user object structure
- **Performance**: Check response times and basic concurrency handling
- **Idempotency**: Ensure repeated PUT/DELETE requests behave consistently
- **Error handling**: Simulate 4xx/5xx server responses

## How to Use

1.  Clone the Repository and Install Dependencies

    ```bash
    git clone https://github.com/ellisn19/api-test-plan.git
    cd api-test-plan
    npm install
    ```

2.  Test Commands

    ```bash
    npm test                             # Run All Tests
    npm test:file <testFilePath>         # Run a Single Test File
    npm run test:watch                   # Reruns all tests on file changes
    npm run test:watch <testFilePath>    # Reruns single test file on file changes
    ```

## Project Structure

```bash
user-api-test-plan/
├── README.md                          # Overview, test plan summary, how to run tests
├── LICENSE
├── package.json                       # NPM dependencies and scripts
├── jest.config.js                     # Jest configuration file
├── .gitignore                         # Ignore node_modules, coverage, etc.
└── tests/                             # All test code organized here
	 ├── users/                        # Group tests by resource/domain
	 │   ├── config/
	 │   │   ├── userSchema.v1.json     # Current Schema for User endpoint
	 │   │   └── endpoints.json         # API endpoints configuration
	 │   ├── localServer/
	 │   │   └── server.js              # Locally hosted server minicing user api
	 │   ├── utils/
	 │   │   ├── __mocks__/
	 │   │   │   └── userApiClient.js   # userApiClient mock file
	 │   │   ├── userFactory.js         # Factory for creating test user data
	 │   │   └── userApiClient.js       # API client for user-related requests
	 │   ├── addUser.test.js            # Tests for POST /users
	 │   ├── deleteUser.test.js         # Tests for DELETE /users/:id
	 │   ├── getUser.test.js            # Tests for GET /users/:id
	 │   ├── getUsers.test.js           # Tests for GET /users (all users)
	 │   └── updateUser.test.js         # Tests for PUT /users/:id
	 └── utils/                         # Utility functions/helpers (e.g., test data setup)
		  └── typeValidator.js          # Type validation functions for test data
```

# Test Scenarios by Endpoint

## GET `/users`

**Docs:** [Fake Store API - Get all users](https://fakestoreapi.com/docs#tag/Users/operation/getAllUsers)

### Functional:

- Returns expected schema on success.
- Returns expected schema on error.
- Returns empty array when no users exist.
- Each user object contains expected fields (`id`, `username`, `email`, `password`).
- Handles additional/unexpected fields gracefully.
- Consistent ordering across repeated requests (unless API specifies otherwise).

### Negative:

- Fails gracefully if server returns malformed JSON.

### Performance:

- Handles 100 users in <500ms.
- Handles 1000 users in <1000ms.
- Concurrency: supports 500 parallel GET requests.

## POST `/users` - Add a new user

**Docs:** [Fake Store API - Add a new user](https://fakestoreapi.com/docs#tag/Users/operation/addUser)

### Functional:

- Returns expected schema on success.
- Returns expected schema on error (error field only).
- Accepts additional properties in request payload.
- Handles additional/unexpected fields returned from server.
- Returns correct user data matching request body.

### Negative:

- Fails when required properties (username, email, password) are missing.
- Fails when values are null or empty.
- Rejects invalid email format.
- Handles cases where all required fields are null or empty.

### Performance:

- Handles 100 parallel user creations.
- Handles 1000 concurrent POST requests successfully.
- Handles large payloads efficiently (10k+ characters in fields).

## GET `/users/:id`

**Docs:** [Fake Store API - Get a single user](https://fakestoreapi.com/docs#tag/Users/operation/getUserById)

### Functional:

- Returns expected schema on success.
- Returns expected schema on error.
- User object matches schema: `{ id, username, email, password }`.
- Returns expected user for given `id`.
- Handles additional/unexpected fields gracefully.

### Negative:

- Returns `400 Bad Request` for non-existent ID.
- Returns `400 Bad Request` if ID is not a number (e.g., `/users/abc`).
- Handles `null` or empty `id` in request path.

### Validation / Contract:

- Ensure returned user matches schema exactly (types and required fields).
- `id` must equal request `:id`.
- `email` field passes email regex.
- Rejects response missing required fields.

### Performance:

- Handles 100 sequential GET requests in <500ms.
- Handles 1000 concurrent GET requests successfully.

## PUT `/users/:id`

**Docs:** [Fake Store API - Update a user](https://fakestoreapi.com/docs#tag/Users/operation/updateUser)

### Functional:

- Returns `200` and updated user object.
- Updated fields persist correctly (username/email/password).
- Can update only one field (partial update).
- Accepts additional properties in request payload without error.
- Handles unexpected fields returned from server gracefully.

### Negative:

- Returns `400 Bad Request` when updating a non-existent user.
- Returns `400 Bad Request` when body is missing required fields.
- Returns error when fields are empty or null.
- Rejects invalid email format.
- Returns error if `id` in path and body mismatch.

### Validation / Contract:

- Response schema matches `{ id, username, email, password }`.
- Response `id` matches request `:id`.
- Field values match payload changes exactly.
- Email passes regex validation.

### Performance:

- Handles 100 sequential updates in <1000ms.
- Handles 500 concurrent updates with no data corruption.
- Handles large payloads (10k+ characters in string fields).

### Idempotency:

- Repeated `PUT` requests with same body return same result.
- No duplicate user creation occurs.

## DELETE `/users/:id`

**Docs:** [Fake Store API - Delete a user](https://fakestoreapi.com/docs#tag/Users/operation/deleteUser)

### Functional:

- Returns `200 OK` on success.
- User is removed from system, GET `/users/:id` returns `400` after deletion.
- Can delete multiple users sequentially.

### Negative:

- Returns `404 Bad Request` when deleting a non-existent user.
- Returns `400 Bad Request` for invalid `id` (non-numeric).

### Validation / Contract:

- Verify user no longer exists in GET `/users`.

### Performance:

- Handles 100 sequential deletes in <1000ms.
- Handles 500 concurrent deletes without race conditions.
- Verify stability under load (e.g., deleting 1000 users).

### Idempotency:

- Repeated `DELETE` on same `id` returns `400 Bad Request`.

## Error Handling (All Endpoints)

- Simulate network failure (timeout, DNS error).
- Simulate server crash (500).
- Handles rate limiting (429).

# Automation Considerations

## Test Framework:

**Mocking**: All requests are mocked with `jest.mock('axios')` to simulate both happy and negative paths.

**Reusable Helpers**:

- `User.createGenericUser()` - generates valid test user data.
- `User.createGenericUsers(count)` - generates list of valid test user data.
- `User.validate(expected, actual)` - ensures user object returned matches expected types and values.
- `userResponses.js` - simulates API responses.

**Assertions**: Validate HTTP status, statusText, response schema, field presence, and value correctness.

## Additional Considerations

### Environment Configuration

Separate config for local/production/new version URLs (`endpoints.json`).

```json
{
	"usersBaseUrl": {
		"v1": "https://fakestoreapi.com/users",
		"localServerUrl": "http://localhost:3000/users"
	}
}
```

Separate config for user schema (`userSchema.v1.json`).

```json
{
	"ID": "id",
	"USERNAME": "username",
	"EMAIL": "email",
	"PASSWORD": "password"
}
```

### API Versioning Strategy

- Schema aware helpers

  - The `User` class exposes versioned schemas through `User.getSchema(version)` and factory methods like `User.createGenericUser(version)`.
  - Tests destructure the fields they need from the schema (`const {ID, USERNAME, ... } = User.getSchema('v2)`), which keeps assertions aligned with the correct version automatically.
  - `UserApiClient` can be constructed with a version specific base URL, so each `describe` block can target a specific API version without duplicating schema logic.

- Local development server (`http://localhost:3000`) for testing.

## Entry Criteria

- API endpoints are reachable at the configured base URL
- Documentation of schema and expected responses is available
- Schema has been properly configured based on documentation
- Node.js + npm installed to run the test framework

## Exit Criteria

- All Critical functional and negative tests pass
- No open blocker or critical defects remain
- Automated test suite runs successfully in CI without failures

## Risks and Assumptions

- Assumes responses from API due to lack of reactivity based on inputs
- Assumes test data can be created/deleted without persistence issues
- Assumes schema remains stable during testing
