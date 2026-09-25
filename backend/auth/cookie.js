'use strict';

const { SESSION_TTL_SECONDS } = require('./tokens');

// Modern browsers (per the W3C Secure Contexts spec) treat http://localhost
// as a potentially trustworthy origin, the same as https:, so they still
// store and resend a Secure-flagged cookie set over it. That is what lets
// dev (localhost:5173/4000) and e2e (localhost:5180/4100) work with Secure
// always on, matching the requirement that it must also always be on in
// production; the e2e admin specs (e.g. e2e/tests/admin-players.spec.js,
// e2e/tests/avatar-upload.spec.js) stay logged in across real Chromium
// requests over http://localhost, which would fail if this were wrong.
function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS * 1000,
  };
}

module.exports = { sessionCookieOptions };
