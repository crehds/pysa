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

test('loadTrustProxy: a positive integer string is a hop count', () => {
  assert.deepEqual(loadTrustProxy({ TRUST_PROXY: '1' }), { valid: true, value: 1 });
  assert.deepEqual(loadTrustProxy({ TRUST_PROXY: '3' }), { valid: true, value: 3 });
});

// "0" is a valid hop count in Express terms, and Express's compileTrust
// already trusts no proxy for a numeric 0, just as for `false`, so this
// normalization is not needed for correctness. It keeps the result
// consistent instead: every "off" spelling (unset, "false", "0") yields
// `false`, never a number.
test('loadTrustProxy: "0" keeps trust proxy off, like unset', () => {
  assert.deepEqual(loadTrustProxy({ TRUST_PROXY: '0' }), { valid: true, value: false });
});

// The README lists "false" as the documented default/off spelling, and
// Express itself cannot compile the literal string "false" (it tries to
// parse it as an IP and throws) -- this used to crash app.js at startup.
test('loadTrustProxy: "false" in any case keeps trust proxy off, and never crashes', () => {
  assert.deepEqual(loadTrustProxy({ TRUST_PROXY: 'false' }), { valid: true, value: false });
  assert.deepEqual(loadTrustProxy({ TRUST_PROXY: 'FALSE' }), { valid: true, value: false });
  assert.deepEqual(loadTrustProxy({ TRUST_PROXY: ' False ' }), { valid: true, value: false });
});

test('loadTrustProxy: "true" in any case is refused, with a reason, never trusted', () => {
  for (const raw of ['true', 'TRUE', ' True ']) {
    const result = loadTrustProxy({ TRUST_PROXY: raw });
    assert.equal(result.valid, false);
    assert.match(result.reason, /every hop/i);
  }
});

test('loadTrustProxy: a comma-separated IP/CIDR list is passed through trimmed', () => {
  assert.deepEqual(loadTrustProxy({ TRUST_PROXY: ' 127.0.0.1,10.0.0.0/8 ' }), {
    valid: true,
    value: '127.0.0.1,10.0.0.0/8',
  });
});

test('loadTrustProxy: an Express preset name is passed through trimmed', () => {
  assert.deepEqual(loadTrustProxy({ TRUST_PROXY: 'loopback' }), { valid: true, value: 'loopback' });
  assert.deepEqual(loadTrustProxy({ TRUST_PROXY: 'linklocal' }), { valid: true, value: 'linklocal' });
  assert.deepEqual(loadTrustProxy({ TRUST_PROXY: 'uniquelocal' }), { valid: true, value: 'uniquelocal' });
});

// Reviewer-confirmed crash: any value Express's own "trust proxy" setting
// cannot compile (it delegates to the proxy-addr package, which treats an
// unrecognized string as an IP to parse) used to reach app.set('trust
// proxy', ...) unvalidated and throw at startup instead of just being
// reported invalid, e.g. "invalid IP address: lopback".
test('loadTrustProxy: a value Express cannot compile is refused, with a reason, instead of crashing later', () => {
  const typo = loadTrustProxy({ TRUST_PROXY: 'lopback' });
  assert.equal(typo.valid, false);
  assert.match(typo.reason, /lopback/);

  const notAnInteger = loadTrustProxy({ TRUST_PROXY: '1.5' });
  assert.equal(notAnInteger.valid, false);
  assert.match(notAnInteger.reason, /1\.5/);
});

test('loadTrustProxy: a list mixing a valid entry with an invalid one is refused as a whole', () => {
  const result = loadTrustProxy({ TRUST_PROXY: '127.0.0.1,lopback' });
  assert.equal(result.valid, false);
  assert.match(result.reason, /lopback/);
});
