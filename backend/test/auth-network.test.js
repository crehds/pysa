'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const cookieParser = require('cookie-parser');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const { createAuthRouter } = require('../auth/network');
const { SESSION_COOKIE_NAME } = require('../auth/tokens');
const {
  TEST_ADMIN_USERNAME,
  TEST_ADMIN_PASSWORD,
  TEST_ADMIN_PASSWORD_HASH,
} = require('../support/authFixtures');

const VALID_CONFIG = {
  valid: true,
  username: TEST_ADMIN_USERNAME,
  passwordHash: TEST_ADMIN_PASSWORD_HASH,
  jwtSecret: 'a'.repeat(32),
};

// supertest's request.agent() cookie jar (the `cookiejar` package) honors
// the Secure attribute the same way a browser does: it only resends a
// Secure cookie over a connection it considers secure, which a plain-HTTP
// local test server never is. Real Chromium *does* send Secure cookies back
// over http://localhost (verified empirically, see the report), so this is
// a test-harness gap, not an application bug; work around it by carrying
// the cookie ourselves instead of relying on the agent's jar.
function extractSessionCookie(res) {
  const setCookieHeader = res.headers['set-cookie'].find((entry) =>
    entry.startsWith(`${SESSION_COOKIE_NAME}=`)
  );
  return setCookieHeader.split(';')[0];
}

// A generous limit so functional tests never trip the rate limiter; a
// dedicated small limit is exercised separately in auth-rate-limit.test.js.
function buildApp(adminConfig) {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/auth', createAuthRouter(adminConfig, { rateLimiter: (req, res, next) => next() }));
  return app;
}

test('POST /auth/login with correct credentials sets a session cookie and returns the username', async () => {
  const app = buildApp(VALID_CONFIG);
  const res = await request(app)
    .post('/auth/login')
    .send({ username: TEST_ADMIN_USERNAME, password: TEST_ADMIN_PASSWORD });

  assert.equal(res.status, 200);
  assert.equal(res.body.error, '');
  assert.equal(res.body.body.username, TEST_ADMIN_USERNAME);

  const cookieHeader = res.headers['set-cookie'].join(';');
  assert.match(cookieHeader, new RegExp(`${SESSION_COOKIE_NAME}=`));
  assert.match(cookieHeader, /HttpOnly/i);
  assert.match(cookieHeader, /Secure/i);
  assert.match(cookieHeader, /SameSite=Lax/i);
  assert.match(cookieHeader, /Path=\//i);
});

test('POST /auth/login with a wrong password returns a generic 401', async () => {
  const app = buildApp(VALID_CONFIG);
  const res = await request(app)
    .post('/auth/login')
    .send({ username: TEST_ADMIN_USERNAME, password: 'definitely-wrong' });
  assert.equal(res.status, 401);
  assert.equal(res.body.body, '');
});

test('POST /auth/login with a wrong username returns the exact same generic 401', async () => {
  const app = buildApp(VALID_CONFIG);
  const withWrongUsername = await request(app)
    .post('/auth/login')
    .send({ username: 'not-the-admin', password: TEST_ADMIN_PASSWORD });
  const withWrongPassword = await request(app)
    .post('/auth/login')
    .send({ username: TEST_ADMIN_USERNAME, password: 'definitely-wrong' });

  assert.equal(withWrongUsername.status, 401);
  assert.equal(withWrongPassword.status, 401);
  assert.equal(withWrongUsername.body.error, withWrongPassword.body.error);
});

test('POST /auth/login still runs bcrypt.compare for an unknown username (no early return)', async () => {
  const originalCompare = bcrypt.compare;
  let called = false;
  bcrypt.compare = async (...args) => {
    called = true;
    return originalCompare(...args);
  };
  try {
    const app = buildApp(VALID_CONFIG);
    await request(app)
      .post('/auth/login')
      .send({ username: 'nobody-registered', password: 'whatever' });
    assert.equal(called, true);
  } finally {
    bcrypt.compare = originalCompare;
  }
});

test('POST /auth/login rejects non-string or oversized credentials with 401, not a 500', async () => {
  const app = buildApp(VALID_CONFIG);

  const nonString = await request(app)
    .post('/auth/login')
    .send({ username: { a: 1 }, password: TEST_ADMIN_PASSWORD });
  assert.equal(nonString.status, 401);

  const oversized = await request(app)
    .post('/auth/login')
    .send({ username: TEST_ADMIN_USERNAME, password: 'x'.repeat(5000) });
  assert.equal(oversized.status, 401);

  const missing = await request(app).post('/auth/login').send({});
  assert.equal(missing.status, 401);
});

test('POST /auth/login answers 503 when the admin config is invalid, without touching bcrypt', async () => {
  const originalCompare = bcrypt.compare;
  let called = false;
  bcrypt.compare = async (...args) => {
    called = true;
    return originalCompare(...args);
  };
  try {
    const app = buildApp({ valid: false, errors: ['ADMIN_USERNAME is not set'] });
    const res = await request(app)
      .post('/auth/login')
      .send({ username: TEST_ADMIN_USERNAME, password: TEST_ADMIN_PASSWORD });
    assert.equal(res.status, 503);
    assert.equal(called, false);
  } finally {
    bcrypt.compare = originalCompare;
  }
});

test('POST /auth/logout clears the cookie and returns 200', async () => {
  const app = buildApp(VALID_CONFIG);
  const res = await request(app).post('/auth/logout');
  assert.equal(res.status, 200);
  const cookieHeader = res.headers['set-cookie'].join(';');
  assert.match(cookieHeader, new RegExp(`${SESSION_COOKIE_NAME}=;`));
});

test('GET /auth/me returns authenticated:true and the username for a logged-in session', async () => {
  const app = buildApp(VALID_CONFIG);
  const loginRes = await request(app)
    .post('/auth/login')
    .send({ username: TEST_ADMIN_USERNAME, password: TEST_ADMIN_PASSWORD });
  const sessionCookie = extractSessionCookie(loginRes);

  const res = await request(app).get('/auth/me').set('Cookie', sessionCookie);
  assert.equal(res.status, 200);
  assert.deepEqual(res.body.body, { authenticated: true, username: TEST_ADMIN_USERNAME });
});

// "Am I logged in?" has a valid answer "no" — it is not an error, so this
// (and every other failure mode below) is a 200, never a 401. Contrast with
// requireAdmin (backend/auth/middleware.js), which still 401s on every
// protected write route; only this session-status check behaves this way.
test('GET /auth/me answers 200 with authenticated:false without a session, not a 401', async () => {
  const app = buildApp(VALID_CONFIG);
  const res = await request(app).get('/auth/me');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body.body, { authenticated: false });
});

test('GET /auth/me answers 200 with authenticated:false for a tampered cookie, identical to a missing one (never reveals why)', async () => {
  const app = buildApp(VALID_CONFIG);
  const missing = await request(app).get('/auth/me');
  const tampered = await request(app)
    .get('/auth/me')
    .set('Cookie', `${SESSION_COOKIE_NAME}=not-a-real-token`);
  assert.equal(tampered.status, 200);
  assert.deepEqual(tampered.body.body, missing.body.body);
});

test('GET /auth/me answers 200 with authenticated:false when the admin config is invalid (not 503, not 401)', async () => {
  const app = buildApp({ valid: false, errors: ['ADMIN_USERNAME is not set'] });
  const res = await request(app).get('/auth/me');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body.body, { authenticated: false });
});

test('logout clears the cookie client-side, but the old token itself stays valid until it expires (stateless JWT, no server-side revocation list)', async () => {
  const app = buildApp(VALID_CONFIG);
  const loginRes = await request(app)
    .post('/auth/login')
    .send({ username: TEST_ADMIN_USERNAME, password: TEST_ADMIN_PASSWORD });
  const sessionCookie = extractSessionCookie(loginRes);

  await request(app).post('/auth/logout').set('Cookie', sessionCookie);

  // The Set-Cookie clearing header itself is already asserted in
  // "POST /auth/logout clears the cookie and returns 200"; a real browser
  // that honors it will never resend this value. Replaying it directly
  // here characterizes the accepted tradeoff of a stateless session: the
  // token is not blocklisted server-side, so it still verifies.
  const res = await request(app).get('/auth/me').set('Cookie', sessionCookie);
  assert.equal(res.status, 200);
  assert.equal(res.body.body.authenticated, true);
});
