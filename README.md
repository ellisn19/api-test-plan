# API Test Plan

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Automation Considerations

### Test Framework:

![Jest](https://img.shields.io/badge/jest-30.0.5-brightgreen) ![Axios](https://img.shields.io/badge/axios-1.5.0-blue)

Mocking: All requests are mocked with `jest.mock('axios')` to simulate both happy and negative paths.

Reusable Helpers:

- `User.createGenericUser()` - generates valid test user data.
- `User.createGenericUsers(count)` - generates list of valid test user data.
- `User.validate()` - ensures user object returned matches expected types and values.
- `userResponses.js` - simulates API responses.

Assertions: Validate HTTP status, statusText, response schema, field presence, and value correctness.

## Additional Considerations

- Environment Configuration
  - Separate config for local/staging/production URLs (`endpoints.json`).
  - Also could include multiple API versions in the same file.
- API Versioning Strategies

  - Option 1: Single Test Suite, Multiple Endpoints
    - Parameterize the test runner to loop over all configured API versions.
    - For example, load `endpoints.userBaseUrl.v1` and `endpoints.userBaseUrl.v2`, and dynamically create `UserApiClient` instances inside `describe.each`
  - Option 2: Seperate Clients and Test Suites

    - Create distinct `UserApiCLientV1` and `UserApiClientV2` (or pass version as a contructor agrument).
    - Duplicate only the tests that differ.
    - Keep shared tests in a common helper function.
    - Best for when versions introduce breaking changes.

  - Local development server (`http://localhost:3000`) for testing.

- Optional: rate limiting / throttling tests.
- Ensure API returns clear, consistent error messages.

## How to Use

1. Clone the Repository

   ```bash
   git clone https://github.com/ellisn19/api-test-plan.git
   cd api-test-plan
   ```

2. Install Dependencies

   ```bash
   npm install
   ```

3. Test Commands

   ```bash
   npm test                             # Run All Tests
   npm test:file <testFilePath>         # Run a Single Test File
   npm run test:watch                   # Reruns all tests on file changes
   npm run test:watch <testFilePath>    # Reruns single test file on file changes
   ```

## Project Structure

```bash
user-api-test-plan/
├── README.md                    # Overview, test plan summary, how to run tests
├── LICENSE
├── package.json                 # NPM dependencies and scripts
├── jest.config.js               # Jest configuration file
├── .gitignore                   # Ignore node_modules, coverage, etc.
└── tests/                       # All test code organized here
    ├── users/                   # Group tests by resource/domain
    │   ├── config/
    │   │   └── endpoints.json   # API endpoints configuration
    │   ├── localServer/
    │   │   └── server.js        # Locally hosted server minicing user api
    │   ├── utils/
    │   │   ├── userFactory.js   # Factory for creating test user data
    │   │   └── userApiClient.js # API client for user-related requests
    │   ├── addUser.test.js      # Tests for POST /users
    │   ├── deleteUser.test.js   # Tests for DELETE /users/:id
    │   ├── getUser.test.js      # Tests for GET /users/:id
    │   ├── getUsers.test.js     # Tests for GET /users (all users)
    │   └── updateUser.test.js   # Tests for PUT /users/:id
    └── utils/                   # Utility functions/helpers (e.g., test data setup)
        └── typeValidator.js     # Type validation functions for test data
```

## Endpoint Overview:

- POST `/users`
- GET `/users`
- GET `/users/:id`
- PUT `/users/:id`
- DELETE `/users/:id`

## Types of Testing:

- Functional testing: Happy path + error scenarios.
- Negative testing: Missing or invalid fields, invalid IDs, empty requests.
- Validation testing: Field types, allowed values, max/min lengths.
- Performance testing: Response time, load, and concurrency.
- Contract testing: Verify response schema matches API documentation.
- Idempotency: Check PUT and DELETE behave correctly if repeated.
- Data consistency: Verify that POST, PUT, DELETE change data as expected.

# Test Scenarios / Cases

## POST `/users`

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

### Error Handling:

- Simulates network failure (timeouts, DNS errors).

---

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

### Error Handling:

- Simulates network failure (timeouts, DNS errors).
- Simulates server error (`500`).
- Simulates throttling / rate-limiting (`429`).

## GET `/users/:id`

**Docs:** [Fake Store API - Get a single user](https://fakestoreapi.com/docs#tag/Users/operation/getUserById)

### Functional:

- Returns expected schema on success.
- Returns expected schema on error.
- User object matches schema: `{ id, username, email, password }`.
- Returns expected user for given `id`.
- Handles additional/unexpected fields gracefully.

### Negative:

- Returns `404 Not Found` for non-existent ID.
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

### Error Handling:

- Simulate server crash (500).
- Simulate network failure (timeout, DNS error).
- Handles rate limiting (429).

## PUT `/users/:id`

**Docs:** [Fake Store API - Update a user](https://fakestoreapi.com/docs#tag/Users/operation/updateUser)

### Functional:

- Returns `200 OK` and updated user object.
- Updated fields persist correctly (username/email/password).
- Can update only one field (partial update).
- Accepts additional properties in request payload without error.
- Handles unexpected fields returned from server gracefully.

### Negative:

- Returns `404 Not Found` when updating a non-existent user.
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

### Error Handling:

- Simulate network failure (timeout, DNS error).
- Simulate server error (500).
- Handles rate limiting (429).

## DELETE `/users/:id`

**Docs:** [Fake Store API - Delete a user](https://fakestoreapi.com/docs#tag/Users/operation/deleteUser)

### Functional:

- Returns `200 OK` or `204 No Content` on success.
- User is removed from system — GET `/users/:id` returns `404` after deletion.
- Can delete multiple users sequentially.
- Returns confirmation object (if API supports it).

### Negative:

- Returns `404 Not Found` when deleting a non-existent user.
- Returns `400 Bad Request` for invalid `id` (non-numeric).
- Unauthorized (401) or forbidden (403) delete attempts handled correctly.

### Validation / Contract:

- Ensure response schema (if any) matches documentation.
- Verify user no longer exists in GET `/users`.
- Ensure no orphaned references (if relational constraints exist).

### Performance:

- Handles 100 sequential deletes in <1000ms.
- Handles 500 concurrent deletes without race conditions.
- Verify stability under load (e.g., deleting 1000 users).

### Idempotency:

- Repeated `DELETE` on same `id` returns `404` or no-op without error.

### Error Handling:

- Simulate network failure (timeout, DNS error).
- Simulate server error (500).
- Handles rate limiting (429).
