'use strict';

const response = require('../response');
const { verifySessionToken, SESSION_COOKIE_NAME } = require('./tokens');

const GENERIC_MESSAGE = 'Not authorized';

// A single generic 401 for every failure mode (missing/tampered/expired
// cookie, wrong secret, or an unconfigured admin) so a caller can never
// distinguish "no session" from "bad session" from "admin not set up".
// adminConfig is captured once at startup (see backend/app.js) and passed
// in explicitly, so this factory stays a pure function of its argument and
// is trivial to unit test with a hand-built valid/invalid config.
function createRequireAdmin(adminConfig) {
  return function requireAdmin(req, res, next) {
    if (!adminConfig.valid) {
      return response.error(req, res, GENERIC_MESSAGE, 401, 'admin login is not configured');
    }

    const token = req.cookies && req.cookies[SESSION_COOKIE_NAME];
    if (!token) {
      return response.error(req, res, GENERIC_MESSAGE, 401, 'missing session cookie');
    }

    try {
      const payload = verifySessionToken(token, adminConfig.jwtSecret);
      req.admin = { username: payload.sub };
      return next();
    } catch (error) {
      return response.error(req, res, GENERIC_MESSAGE, 401, error.message);
    }
  };
}

module.exports = { createRequireAdmin };
