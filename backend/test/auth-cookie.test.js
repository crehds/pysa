'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { sessionCookieOptions } = require('../auth/cookie');
const { SESSION_TTL_SECONDS } = require('../auth/tokens');

test('sessionCookieOptions: httpOnly, Secure, SameSite=Lax, path / and an 8h maxAge', () => {
  const options = sessionCookieOptions();
  assert.equal(options.httpOnly, true);
  // Verified empirically (see the report): Chromium accepts and returns a
  // Secure cookie set by a plain http://localhost response, so Secure is
  // always on rather than gated behind an env var.
  assert.equal(options.secure, true);
  assert.equal(options.sameSite, 'lax');
  assert.equal(options.path, '/');
  assert.equal(options.maxAge, SESSION_TTL_SECONDS * 1000);
});
