'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const response = require('../response');
const { signSessionToken, SESSION_COOKIE_NAME } = require('./tokens');
const { sessionCookieOptions } = require('./cookie');
const { createLoginRateLimiter } = require('./rateLimiter');
const { createRequireAdmin } = require('./middleware');

const MAX_CREDENTIAL_LENGTH = 200;
const GENERIC_LOGIN_ERROR = 'Invalid username or password';

function isSaneCredential(value) {
  return typeof value === 'string' && value.length > 0 && value.length <= MAX_CREDENTIAL_LENGTH;
}

// adminConfig is loaded once at startup (backend/app.js) and passed in, so
// this router never reads process.env itself; that keeps it a pure factory
// of its arguments and testable with a hand-built valid/invalid config
// instead of a real Express app + Mongo.
function createAuthRouter(adminConfig, { rateLimiter } = {}) {
  const router = express.Router();
  const loginRateLimiter = rateLimiter || createLoginRateLimiter();
  const requireAdmin = createRequireAdmin(adminConfig);

  router.post('/login', loginRateLimiter, async function (req, res) {
    if (!adminConfig.valid) {
      return response.error(
        req,
        res,
        'Admin login is not configured',
        503,
        `admin env vars missing or invalid: ${adminConfig.errors.join('; ')}`
      );
    }

    const { username, password } = req.body || {};
    if (!isSaneCredential(username) || !isSaneCredential(password)) {
      return response.error(req, res, GENERIC_LOGIN_ERROR, 401, 'malformed credentials');
    }

    // bcrypt.compare always runs, even when the username is already known
    // to be wrong, so a wrong-username response takes the same time as a
    // wrong-password one and leaks nothing through timing.
    const isValidPassword = await bcrypt.compare(password, adminConfig.passwordHash);
    const isValidUsername = username === adminConfig.username;

    if (!isValidUsername || !isValidPassword) {
      return response.error(req, res, GENERIC_LOGIN_ERROR, 401, 'bad credentials');
    }

    const token = signSessionToken(adminConfig.username, adminConfig.jwtSecret);
    res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions());
    response.success(req, res, { username: adminConfig.username }, 200);
  });

  router.post('/logout', function (req, res) {
    res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
    response.success(req, res, {}, 200);
  });

  router.get('/me', requireAdmin, function (req, res) {
    response.success(req, res, { username: req.admin.username }, 200);
  });

  return router;
}

module.exports = { createAuthRouter };
