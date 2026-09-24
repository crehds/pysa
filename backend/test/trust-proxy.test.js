'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const cookieParser = require('cookie-parser');
const request = require('supertest');
const { createAuthRouter } = require('../auth/network');
const { createLoginRateLimiter } = require('../auth/rateLimiter');
const { loadTrustProxy } = require('../auth/config');
const {
  TEST_ADMIN_USERNAME,
  TEST_ADMIN_PASSWORD_HASH,
} = require('../support/authFixtures');

const VALID_CONFIG = {
  valid: true,
  username: TEST_ADMIN_USERNAME,
  passwordHash: TEST_ADMIN_PASSWORD_HASH,
  jwtSecret: 'a'.repeat(32),
};

// Small limit so this stays fast: two attempts from one client are enough
// to trip it while a distinct client is still evaluated normally.
function buildApp(env) {
  const app = express();
  const trustProxy = loadTrustProxy(env);
  app.set('trust proxy', trustProxy.value);
  app.use(express.json());
  app.use(cookieParser());
  const rateLimiter = createLoginRateLimiter({ windowMs: 60_000, max: 2 });
  app.use('/auth', createAuthRouter(VALID_CONFIG, { rateLimiter }));
  return app;
}

test('with TRUST_PROXY set, two different X-Forwarded-For clients get separate rate-limit buckets', async () => {
  const app = buildApp({ TRUST_PROXY: '1' });

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const res = await request(app)
      .post('/auth/login')
      .set('X-Forwarded-For', '10.0.0.1')
      .send({ username: TEST_ADMIN_USERNAME, password: 'wrong' });
    assert.equal(res.status, 401, `client A attempt ${attempt} should be evaluated normally`);
  }

  const clientALimited = await request(app)
    .post('/auth/login')
    .set('X-Forwarded-For', '10.0.0.1')
    .send({ username: TEST_ADMIN_USERNAME, password: 'wrong' });
  assert.equal(clientALimited.status, 429);

  // A distinct client (different X-Forwarded-For) is unaffected: with
  // TRUST_PROXY set, Express derives req.ip from the header instead of the
  // shared proxy socket, so the rate limiter keys them separately.
  const clientBStillEvaluated = await request(app)
    .post('/auth/login')
    .set('X-Forwarded-For', '10.0.0.2')
    .send({ username: TEST_ADMIN_USERNAME, password: 'wrong' });
  assert.equal(clientBStillEvaluated.status, 401);
});

test('without TRUST_PROXY, X-Forwarded-For is ignored and every client shares one bucket', async () => {
  const app = buildApp({});

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const res = await request(app)
      .post('/auth/login')
      .set('X-Forwarded-For', '10.0.0.1')
      .send({ username: TEST_ADMIN_USERNAME, password: 'wrong' });
    assert.equal(res.status, 401, `attempt ${attempt} should be evaluated normally`);
  }

  // A different X-Forwarded-For does not open a new bucket: without trust
  // proxy, Express ignores the header entirely and every request resolves
  // to the same socket address (this is exactly the deploy bug being
  // fixed, reproduced here without a real reverse proxy in front).
  const stillLimited = await request(app)
    .post('/auth/login')
    .set('X-Forwarded-For', '10.0.0.2')
    .send({ username: TEST_ADMIN_USERNAME, password: 'wrong' });
  assert.equal(stillLimited.status, 429);
});
