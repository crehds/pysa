'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const cookieParser = require('cookie-parser');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { createRequireAdmin } = require('../auth/middleware');
const { signSessionToken, SESSION_COOKIE_NAME } = require('../auth/tokens');
const { TEST_JWT_SECRET } = require('../support/authFixtures');

const VALID_CONFIG = {
  valid: true,
  username: 'admin',
  passwordHash: 'irrelevant-for-this-file',
  jwtSecret: TEST_JWT_SECRET,
};
const INVALID_CONFIG = { valid: false, errors: ['ADMIN_USERNAME is not set'] };

function buildApp(adminConfig) {
  const app = express();
  app.use(cookieParser());
  app.get('/protected', createRequireAdmin(adminConfig), (req, res) => {
    res.status(200).json({ error: '', body: { username: req.admin.username } });
  });
  return app;
}

test('requireAdmin: 401 when there is no session cookie at all (anonymous write)', async () => {
  const app = buildApp(VALID_CONFIG);
  const res = await request(app).get('/protected');
  assert.equal(res.status, 401);
});

test('requireAdmin: 401 when the admin config itself is invalid, even with an otherwise-valid cookie', async () => {
  const app = buildApp(INVALID_CONFIG);
  // Signed with some secret the (unconfigured) server never had a chance to
  // pick, but the point is: an unconfigured admin must fail closed
  // regardless of what the caller presents.
  const token = signSessionToken('admin', TEST_JWT_SECRET);
  const res = await request(app)
    .get('/protected')
    .set('Cookie', `${SESSION_COOKIE_NAME}=${token}`);
  assert.equal(res.status, 401);
});

test('requireAdmin: 401 on a tampered cookie value', async () => {
  const app = buildApp(VALID_CONFIG);
  const token = signSessionToken('admin', TEST_JWT_SECRET);
  const tampered = `${token.slice(0, -2)}zz`;
  const res = await request(app)
    .get('/protected')
    .set('Cookie', `${SESSION_COOKIE_NAME}=${tampered}`);
  assert.equal(res.status, 401);
});

test('requireAdmin: 401 on a token signed with a different secret', async () => {
  const app = buildApp(VALID_CONFIG);
  const token = signSessionToken('admin', 'a-completely-different-secret-32ch');
  const res = await request(app)
    .get('/protected')
    .set('Cookie', `${SESSION_COOKIE_NAME}=${token}`);
  assert.equal(res.status, 401);
});

test('requireAdmin: 401 on an expired token', async () => {
  const app = buildApp(VALID_CONFIG);
  const expired = jwt.sign({ sub: 'admin' }, TEST_JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: -1,
  });
  const res = await request(app)
    .get('/protected')
    .set('Cookie', `${SESSION_COOKIE_NAME}=${expired}`);
  assert.equal(res.status, 401);
});

test('requireAdmin: 200 and req.admin.username set on a valid cookie', async () => {
  const app = buildApp(VALID_CONFIG);
  const token = signSessionToken('admin', TEST_JWT_SECRET);
  const res = await request(app)
    .get('/protected')
    .set('Cookie', `${SESSION_COOKIE_NAME}=${token}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.body.username, 'admin');
});

test('requireAdmin: every failure mode returns the exact same generic message', async () => {
  const app = buildApp(VALID_CONFIG);
  const missing = await request(app).get('/protected');
  const tampered = await request(app)
    .get('/protected')
    .set('Cookie', `${SESSION_COOKIE_NAME}=not-a-real-token`);
  assert.equal(missing.status, 401);
  assert.equal(tampered.status, 401);
  assert.equal(missing.body.error, tampered.body.error);
  assert.doesNotMatch(missing.body.error, /jwt|token|secret/i);
});
