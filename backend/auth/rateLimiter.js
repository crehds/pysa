'use strict';

const rateLimit = require('express-rate-limit');
const response = require('../response');

const DEFAULT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const DEFAULT_MAX_ATTEMPTS = 10;

// windowMs/max default to env vars (so an operator can retune without a
// code change) and ultimately to the spec's 10-per-15-minutes; an explicit
// argument (used by tests) always wins over both.
function createLoginRateLimiter({ windowMs, max } = {}) {
  return rateLimit({
    windowMs: windowMs ?? (Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS) || DEFAULT_WINDOW_MS),
    max: max ?? (Number(process.env.LOGIN_RATE_LIMIT_MAX) || DEFAULT_MAX_ATTEMPTS),
    standardHeaders: true,
    legacyHeaders: false,
    handler(req, res) {
      response.error(req, res, 'Too many login attempts, try again later', 429, 'login rate limit exceeded');
    },
  });
}

module.exports = { createLoginRateLimiter, DEFAULT_WINDOW_MS, DEFAULT_MAX_ATTEMPTS };
