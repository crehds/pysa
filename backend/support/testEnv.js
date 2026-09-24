'use strict';

// Shared test bootstrap. NOT placed under test/ on purpose: node --test treats
// every file inside a directory named "test" as a test file, and this module
// has no test() calls of its own.
//
// Safety: point MONGODB_URI at a database whose name ends with "_test" BEFORE
// requiring app.js, so tests can never run against a real/dev database.

const TEST_MONGODB_URI =
  process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/pysa_test';

const dbName = TEST_MONGODB_URI.split('/').pop().split('?')[0];
if (!dbName.endsWith('_test')) {
  throw new Error(
    `Refusing to run tests against database "${dbName}": TEST_MONGODB_URI must ` +
      'point to a database whose name ends with "_test".'
  );
}

process.env.MONGODB_URI = TEST_MONGODB_URI;

// Same idea as MONGODB_URI above: force known, test-only admin credentials
// before requiring app.js, unconditionally, so the integration suite can
// log in and exercise protected routes without ever touching
// backend/.env or depending on the developer's shell env — a shell that
// happens to export ADMIN_USERNAME/ADMIN_PASSWORD_HASH would otherwise make
// the backend load those while loginAsAdmin (below) still sends the
// fixture credentials, so every protected-route test would fail with a
// shell-dependent 401.
const {
  TEST_ADMIN_USERNAME,
  TEST_ADMIN_PASSWORD,
  TEST_ADMIN_PASSWORD_HASH,
  TEST_JWT_SECRET,
} = require('./authFixtures');

process.env.ADMIN_USERNAME = TEST_ADMIN_USERNAME;
process.env.ADMIN_PASSWORD_HASH = TEST_ADMIN_PASSWORD_HASH;
process.env.JWT_SECRET = TEST_JWT_SECRET;

const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const { SESSION_COOKIE_NAME } = require('../auth/tokens');

function waitForConnection(timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(
        new Error(`Timed out waiting for the mongoose connection after ${timeoutMs}ms`)
      );
    }, timeoutMs);
    // Only the wait itself should hold the process open, never this timer.
    timer.unref?.();

    mongoose.connection
      .asPromise()
      .then((connection) => {
        clearTimeout(timer);
        resolve(connection);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

async function resetDatabase() {
  await waitForConnection();
  await mongoose.connection.dropDatabase();
}

async function disconnect() {
  await mongoose.disconnect();
}

// Logs in as the test admin and returns a request-like object whose
// get/post/patch/put/delete already carry the session cookie, so callers
// can swap `request(app)` for `await loginAsAdmin()` at protected call
// sites with no other change.
//
// Not request.agent(app): supertest's agent cookie jar (the `cookiejar`
// package) honors the Secure attribute like a browser and never resends a
// Secure cookie over the plain-HTTP connection supertest uses internally,
// so the session would silently vanish after login. Carrying the cookie
// ourselves sidesteps that test-harness limitation. Real browsers do
// resend it: Chromium treats http://localhost as a potentially trustworthy
// origin (see backend/auth/cookie.js), and the e2e admin specs (e.g.
// e2e/tests/admin-players.spec.js, e2e/tests/avatar-upload.spec.js) stay
// logged in across real requests over http://localhost, which is the
// empirical check for that claim.
async function loginAsAdmin() {
  const loginRes = await request(app)
    .post('/auth/login')
    .send({ username: TEST_ADMIN_USERNAME, password: TEST_ADMIN_PASSWORD });
  // A failed login (e.g. rate limited, or the admin config is invalid) may
  // send no Set-Cookie header at all, not just a Set-Cookie without our
  // cookie; default to [] so that case throws this function's own error
  // below instead of a TypeError from calling .find on undefined.
  const setCookieHeader = (loginRes.headers['set-cookie'] || []).find((entry) =>
    entry.startsWith(`${SESSION_COOKIE_NAME}=`)
  );
  if (!setCookieHeader) {
    throw new Error(
      `loginAsAdmin: the test admin login did not set a session cookie (status ${loginRes.status})`
    );
  }
  const sessionCookie = setCookieHeader.split(';')[0];

  const withCookie = (method) => (url) => request(app)[method](url).set('Cookie', sessionCookie);
  return {
    get: withCookie('get'),
    post: withCookie('post'),
    patch: withCookie('patch'),
    put: withCookie('put'),
    delete: withCookie('delete'),
  };
}

module.exports = {
  app,
  mongoose,
  resetDatabase,
  disconnect,
  TEST_MONGODB_URI,
  TEST_ADMIN_USERNAME,
  TEST_ADMIN_PASSWORD,
  loginAsAdmin,
};
