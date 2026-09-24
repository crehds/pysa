'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const cookieParser = require('cookie-parser');
const request = require('supertest');
const { createAuthRouter } = require('../auth/network');
const {
  createLoginRateLimiter,
  DEFAULT_WINDOW_MS,
  DEFAULT_MAX_ATTEMPTS,
} = require('../auth/rateLimiter');
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

function buildApp(rateLimiter) {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/auth', createAuthRouter(VALID_CONFIG, { rateLimiter }));
  return app;
}

test('the default login rate limiter allows 10 attempts per 15 minutes unless overridden', () => {
  assert.equal(DEFAULT_MAX_ATTEMPTS, 10);
  assert.equal(DEFAULT_WINDOW_MS, 15 * 60 * 1000);
});

test('POST /auth/login is rate limited after the configured number of attempts, per IP', async () => {
  const rateLimiter = createLoginRateLimiter({ windowMs: 60_000, max: 3 });
  const app = buildApp(rateLimiter);
  const agent = request.agent(app);

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const res = await agent
      .post('/auth/login')
      .send({ username: TEST_ADMIN_USERNAME, password: 'wrong' });
    assert.equal(res.status, 401, `attempt ${attempt} should be evaluated normally`);
  }

  const fourthAttempt = await agent
    .post('/auth/login')
    .send({ username: TEST_ADMIN_USERNAME, password: 'wrong' });
  assert.equal(fourthAttempt.status, 429);

  // Correct credentials are rate limited too, not only the failing ones.
  const correctButLimited = await agent
    .post('/auth/login')
    .send({ username: TEST_ADMIN_USERNAME, password: TEST_ADMIN_PASSWORD });
  assert.equal(correctButLimited.status, 429);
});
