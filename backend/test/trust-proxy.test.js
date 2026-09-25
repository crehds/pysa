'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
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
// to trip it while a distinct client is still evaluated normally. Mirrors
// app.js: only calls app.set when the loader reports the value valid,
// instead of forwarding trustProxy.value unconditionally -- an invalid
// value (e.g. a typo) has no usable `value` and must never reach app.set
// here either, the same as it must not in app.js.
function buildApp(env) {
  const app = express();
  const trustProxy = loadTrustProxy(env);
  if (trustProxy.valid) {
    app.set('trust proxy', trustProxy.value);
  }
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

test('an invalid TRUST_PROXY value never reaches app.set: the app still builds and serves, trust proxy off', async () => {
  const app = buildApp({ TRUST_PROXY: 'lopback' });

  assert.equal(app.get('trust proxy'), false);
  const res = await request(app)
    .post('/auth/login')
    .send({ username: TEST_ADMIN_USERNAME, password: 'wrong' });
  assert.equal(res.status, 401);
});

test('app.js itself refuses an invalid TRUST_PROXY value at startup: warns with the reason, keeps trust proxy off, and stays up', () => {
  const backendDir = path.join(__dirname, '..');
  const env = {
    ...process.env,
    MONGODB_URI: 'mongodb://127.0.0.1:27017/pysa_test',
    TRUST_PROXY: 'lopback',
  };

  const result = spawnSync(
    process.execPath,
    [
      '-e',
      "const app = require('./app'); process.stdout.write(String(app.get('trust proxy'))); process.exit(0);",
    ],
    // Generous but bounded: without a timeout, a hang here (e.g. app.js
    // ever blocking on a real network call instead of failing fast) would
    // stall the whole test run instead of failing just this one test.
    { cwd: backendDir, env, encoding: 'utf8', timeout: 20000 }
  );

  // Checked before the assertions below so a timeout or kill fails here,
  // with the child's own stderr attached, instead of falling through to a
  // confusing failure on a null status or empty stdout.
  assert.ok(
    !result.error && result.signal === null,
    `child process did not exit normally (error: ${result.error}, signal: ${result.signal}); stderr: ${result.stderr}`
  );

  assert.equal(result.status, 0);
  // app.js has its own unrelated startup logging (e.g. "servidor
  // encendido"), so only the last stdout line -- this script's own -- is
  // asserted on.
  const lines = result.stdout.trim().split('\n');
  assert.equal(lines[lines.length - 1], 'false');
  assert.match(result.stderr, /TRUST_PROXY is invalid/);
  assert.match(result.stderr, /lopback/);
});
