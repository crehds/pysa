'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { sessionCookieOptions } = require('../auth/cookie');
const { SESSION_TTL_SECONDS } = require('../auth/tokens');

test('sessionCookieOptions: httpOnly, Secure, SameSite=Lax, path / and an 8h maxAge', () => {
  const options = sessionCookieOptions();
  assert.equal(options.httpOnly, true);
  // Chromium (and other modern browsers) treat http://localhost as a
  // potentially trustworthy origin and accept/return a Secure cookie set
  // over it (see backend/auth/cookie.js), so Secure is always on rather
  // than gated behind an env var.
  assert.equal(options.secure, true);
  assert.equal(options.sameSite, 'lax');
  assert.equal(options.path, '/');
  assert.equal(options.maxAge, SESSION_TTL_SECONDS * 1000);
});
