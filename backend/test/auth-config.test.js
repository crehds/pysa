'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loadAdminConfig, loadAllowedOrigins, loadTrustProxy } = require('../auth/config');
const { TEST_ADMIN_PASSWORD_HASH, TEST_JWT_SECRET } = require('../support/authFixtures');

test('loadAdminConfig: valid env returns a valid config with the exact values', () => {
  const config = loadAdminConfig({
    ADMIN_USERNAME: 'admin',
    ADMIN_PASSWORD_HASH: TEST_ADMIN_PASSWORD_HASH,
    JWT_SECRET: TEST_JWT_SECRET,
  });
  assert.equal(config.valid, true);
  assert.equal(config.username, 'admin');
  assert.equal(config.passwordHash, TEST_ADMIN_PASSWORD_HASH);
  assert.equal(config.jwtSecret, TEST_JWT_SECRET);
});

test('loadAdminConfig: missing ADMIN_USERNAME is invalid', () => {
  const config = loadAdminConfig({
    ADMIN_PASSWORD_HASH: TEST_ADMIN_PASSWORD_HASH,
    JWT_SECRET: TEST_JWT_SECRET,
  });
  assert.equal(config.valid, false);
  assert.ok(config.errors.some((message) => /ADMIN_USERNAME/.test(message)));
});

test('loadAdminConfig: a blank ADMIN_USERNAME is invalid', () => {
  const config = loadAdminConfig({
    ADMIN_USERNAME: '   ',
    ADMIN_PASSWORD_HASH: TEST_ADMIN_PASSWORD_HASH,
    JWT_SECRET: TEST_JWT_SECRET,
  });
  assert.equal(config.valid, false);
});

test('loadAdminConfig: missing ADMIN_PASSWORD_HASH is invalid', () => {
  const config = loadAdminConfig({
    ADMIN_USERNAME: 'admin',
    JWT_SECRET: TEST_JWT_SECRET,
  });
  assert.equal(config.valid, false);
  assert.ok(config.errors.some((message) => /ADMIN_PASSWORD_HASH/.test(message)));
});

test('loadAdminConfig: a value that is not a bcrypt hash is invalid', () => {
  const config = loadAdminConfig({
    ADMIN_USERNAME: 'admin',
    ADMIN_PASSWORD_HASH: 'plaintext-not-a-hash',
    JWT_SECRET: TEST_JWT_SECRET,
  });
  assert.equal(config.valid, false);
  assert.ok(config.errors.some((message) => /ADMIN_PASSWORD_HASH/.test(message)));
});

test('loadAdminConfig: JWT_SECRET shorter than 32 chars is invalid', () => {
  const config = loadAdminConfig({
    ADMIN_USERNAME: 'admin',
    ADMIN_PASSWORD_HASH: TEST_ADMIN_PASSWORD_HASH,
    JWT_SECRET: 'too-short',
  });
  assert.equal(config.valid, false);
  assert.ok(config.errors.some((message) => /JWT_SECRET/.test(message)));
});

test('loadAdminConfig: a 32-char JWT_SECRET is the accepted minimum', () => {
  const config = loadAdminConfig({
    ADMIN_USERNAME: 'admin',
    ADMIN_PASSWORD_HASH: TEST_ADMIN_PASSWORD_HASH,
    JWT_SECRET: 'x'.repeat(32),
  });
  assert.equal(config.valid, true);
});

test('loadAdminConfig: every var missing reports one error per var', () => {
  const config = loadAdminConfig({});
  assert.equal(config.valid, false);
  assert.equal(config.errors.length, 3);
});

test('loadAllowedOrigins: defaults to http://localhost:5173 when unset', () => {
  assert.deepEqual(loadAllowedOrigins({}), ['http://localhost:5173']);
});

test('loadAllowedOrigins: parses a comma-separated list and trims whitespace', () => {
  const origins = loadAllowedOrigins({
    ALLOWED_ORIGINS: 'http://localhost:5173, http://localhost:5180 ,https://pysa.example.com',
  });
  assert.deepEqual(origins, [
    'http://localhost:5173',
    'http://localhost:5180',
    'https://pysa.example.com',
  ]);
});

test('loadAllowedOrigins: a blank value falls back to the default', () => {
  assert.deepEqual(loadAllowedOrigins({ ALLOWED_ORIGINS: '   ' }), ['http://localhost:5173']);
});

test('loadTrustProxy: unset keeps trust proxy off (today\'s behavior)', () => {
  assert.deepEqual(loadTrustProxy({}), { valid: true, value: false });
});

test('loadTrustProxy: a blank value keeps trust proxy off', () => {
  assert.deepEqual(loadTrustProxy({ TRUST_PROXY: '   ' }), { valid: true, value: false });
});

test('loadTrustProxy: a non-negative integer string is a hop count', () => {
  assert.deepEqual(loadTrustProxy({ TRUST_PROXY: '1' }), { valid: true, value: 1 });
  assert.deepEqual(loadTrustProxy({ TRUST_PROXY: '0' }), { valid: true, value: 0 });
  assert.deepEqual(loadTrustProxy({ TRUST_PROXY: '3' }), { valid: true, value: 3 });
});

test('loadTrustProxy: "true" in any case is refused, never trusted', () => {
  assert.deepEqual(loadTrustProxy({ TRUST_PROXY: 'true' }), { valid: false });
  assert.deepEqual(loadTrustProxy({ TRUST_PROXY: 'TRUE' }), { valid: false });
  assert.deepEqual(loadTrustProxy({ TRUST_PROXY: ' True ' }), { valid: false });
});

test('loadTrustProxy: a comma-separated IP/CIDR list is passed through trimmed', () => {
  assert.deepEqual(loadTrustProxy({ TRUST_PROXY: ' 127.0.0.1,10.0.0.0/8 ' }), {
    valid: true,
    value: '127.0.0.1,10.0.0.0/8',
  });
});

test('loadTrustProxy: an Express preset name is passed through trimmed', () => {
  assert.deepEqual(loadTrustProxy({ TRUST_PROXY: 'loopback' }), { valid: true, value: 'loopback' });
});
