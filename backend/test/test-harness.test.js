'use strict';

// Forces the login rate limit to 1 attempt for this file's own app instance
// before requiring testEnv/app below (each backend/test/*.test.js file is
// its own process under `node --test`, so this never affects any other
// test file's rate limiter). That lets the second test below drive a real
// 429 with no Set-Cookie header, to exercise loginAsAdmin's fix.
process.env.LOGIN_RATE_LIMIT_MAX = '1';
// Set before requiring testEnv on purpose: proves testEnv.js forces the
// admin fixtures unconditionally instead of falling back to whatever a
// developer's shell happens to export (see testEnv.js).
process.env.ADMIN_USERNAME = 'someone-else';

const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const {
  app,
  disconnect,
  loginAsAdmin,
  TEST_ADMIN_USERNAME,
  TEST_ADMIN_PASSWORD,
} = require('../support/testEnv');

test('testEnv.js forces ADMIN_USERNAME to the fixture value regardless of a pre-set shell env var', () => {
  assert.equal(process.env.ADMIN_USERNAME, TEST_ADMIN_USERNAME);
  assert.notEqual(process.env.ADMIN_USERNAME, 'someone-else');
});

test('loginAsAdmin throws a descriptive error (not a TypeError) when the login response has no Set-Cookie header', async () => {
  // Exhaust the rate limiter (LOGIN_RATE_LIMIT_MAX=1 above) so the very
  // next login attempt answers 429 with no Set-Cookie header at all.
  const first = await request(app)
    .post('/auth/login')
    .send({ username: TEST_ADMIN_USERNAME, password: TEST_ADMIN_PASSWORD });
  assert.equal(first.status, 200);

  await assert.rejects(
    () => loginAsAdmin(),
    (error) => {
      assert.match(error.message, /429/);
      return true;
    }
  );
});

after(disconnect);
