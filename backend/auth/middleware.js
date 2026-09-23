'use strict';

const response = require('../response');
const { verifySessionToken, SESSION_COOKIE_NAME } = require('./tokens');

const GENERIC_MESSAGE = 'Not authorized';

// Verifies the session cookie against adminConfig without ever throwing or
// sending a response: returns { admin, reason }, where admin is the
// authenticated identity or null, and reason is a short, server-side-only
// explanation (never sent to the client — see createRequireAdmin's
// generic 401 and createResolveAdmin's plain authenticated:false) for
// exactly why it is null. Shared by both middlewares below so "what counts
// as a valid session" is defined in exactly one place.
function resolveSession(req, adminConfig) {
  if (!adminConfig.valid) {
    return { admin: null, reason: 'admin login is not configured' };
  }

  const token = req.cookies && req.cookies[SESSION_COOKIE_NAME];
  if (!token) {
    return { admin: null, reason: 'missing session cookie' };
  }

  try {
    const payload = verifySessionToken(token, adminConfig.jwtSecret);
    return { admin: { username: payload.sub }, reason: null };
  } catch (error) {
    return { admin: null, reason: error.message };
  }
}

// A single generic 401 for every failure mode (missing/tampered/expired
// cookie, wrong secret, or an unconfigured admin) so a caller can never
// distinguish "no session" from "bad session" from "admin not set up".
// adminConfig is captured once at startup (see backend/app.js) and passed
// in explicitly, so this factory stays a pure function of its argument and
// is trivial to unit test with a hand-built valid/invalid config. Used to
// protect every state-changing route.
function createRequireAdmin(adminConfig) {
  return function requireAdmin(req, res, next) {
    const { admin, reason } = resolveSession(req, adminConfig);
    if (!admin) {
      return response.error(req, res, GENERIC_MESSAGE, 401, reason);
    }
    req.admin = admin;
    return next();
  };
}

// Never rejects the request: "am I logged in?" has a valid answer "no", so
// this only ever attaches req.admin (the identity, or null) and calls
// next(), leaving the actual response to the route. Backs GET /auth/me,
// which must answer 200 either way and never reveal why a session was
// rejected — never use this to protect a route that should require login;
// use createRequireAdmin for that.
function createResolveAdmin(adminConfig) {
  return function resolveAdmin(req, res, next) {
    req.admin = resolveSession(req, adminConfig).admin;
    next();
  };
}

module.exports = { createRequireAdmin, createResolveAdmin };
