'use strict';

const { SESSION_TTL_SECONDS } = require('./tokens');

// Verified empirically against real Chromium (see the report): a Secure
// cookie set by a plain http://localhost response is still stored and sent
// back by the browser, so dev (localhost:5173/4000) and e2e
// (localhost:5180/4100) work with Secure always on, matching the
// requirement that it must also always be on in production.
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
