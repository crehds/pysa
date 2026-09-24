'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const {
  signSessionToken,
  verifySessionToken,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
} = require('../auth/tokens');
const { TEST_JWT_SECRET } = require('../support/authFixtures');

test('signSessionToken then verifySessionToken round-trips the username', () => {
  const token = signSessionToken('admin', TEST_JWT_SECRET);
  const payload = verifySessionToken(token, TEST_JWT_SECRET);
  assert.equal(payload.sub, 'admin');
});

test('the signed token uses HS256 and expires 8 hours after issue', () => {
  const token = signSessionToken('admin', TEST_JWT_SECRET);
  const decoded = jwt.decode(token, { complete: true });
  assert.equal(decoded.header.alg, 'HS256');
  assert.equal(SESSION_TTL_SECONDS, 8 * 60 * 60);
  assert.equal(decoded.payload.exp - decoded.payload.iat, SESSION_TTL_SECONDS);
});

test('verifySessionToken rejects a token signed with a different secret', () => {
  const token = signSessionToken('admin', TEST_JWT_SECRET);
  assert.throws(() => verifySessionToken(token, 'b'.repeat(32)));
});

test('verifySessionToken rejects an expired token', () => {
  const expired = jwt.sign({ sub: 'admin' }, TEST_JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: -1,
  });
  assert.throws(() => verifySessionToken(expired, TEST_JWT_SECRET), /expired/);
});

test('verifySessionToken rejects a token signed with a different algorithm', () => {
  const wrongAlg = jwt.sign({ sub: 'admin' }, TEST_JWT_SECRET, { algorithm: 'HS384' });
  assert.throws(() => verifySessionToken(wrongAlg, TEST_JWT_SECRET));
});

test('verifySessionToken rejects an unsigned "none"-algorithm token', () => {
  const noneToken = jwt.sign({ sub: 'admin' }, null, { algorithm: 'none' });
  assert.throws(() => verifySessionToken(noneToken, TEST_JWT_SECRET));
});

test('the session cookie is named pysa_session', () => {
  assert.equal(SESSION_COOKIE_NAME, 'pysa_session');
});
