'use strict';

const jwt = require('jsonwebtoken');

const SESSION_COOKIE_NAME = 'pysa_session';
const SESSION_TTL_SECONDS = 8 * 60 * 60; // 8h

function signSessionToken(username, jwtSecret) {
  return jwt.sign({ sub: username }, jwtSecret, {
    algorithm: 'HS256',
    expiresIn: SESSION_TTL_SECONDS,
  });
}

// Restricting algorithms to exactly HS256 (never trusting the token's own
// header) is what stops an alg-confusion or "none"-algorithm forged cookie
// from ever verifying.
function verifySessionToken(token, jwtSecret) {
  return jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
}

module.exports = {
  signSessionToken,
  verifySessionToken,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
};
