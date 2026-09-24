'use strict';

// Loads and validates the admin login configuration from environment
// variables. Pure and side-effect-free (no console output, no caching) so
// callers can log a startup warning exactly once at their own boundary and
// tests can exercise every combination with plain objects instead of
// mutating process.env.

// Used only to validate a candidate TRUST_PROXY string the exact same way
// Express itself will (see loadTrustProxy below) -- no app built here is
// ever served.
const express = require('express');

const BCRYPT_HASH_RE = /^\$2[aby]\$\d{2}\$/;
const MIN_JWT_SECRET_LENGTH = 32;
const DEFAULT_ALLOWED_ORIGIN = 'http://localhost:5173';

function isNonBlankString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

// Returns { valid: true, username, passwordHash, jwtSecret } when every
// admin env var is present and well-formed, otherwise
// { valid: false, errors: [...] } with one human-readable reason per
// missing/invalid var (never the values themselves).
function loadAdminConfig(env = process.env) {
  const errors = [];
  const username = env.ADMIN_USERNAME;
  const passwordHash = env.ADMIN_PASSWORD_HASH;
  const jwtSecret = env.JWT_SECRET;

  if (!isNonBlankString(username)) {
    errors.push('ADMIN_USERNAME is not set');
  }
  if (!isNonBlankString(passwordHash) || !BCRYPT_HASH_RE.test(passwordHash)) {
    errors.push('ADMIN_PASSWORD_HASH is not set or is not a bcrypt hash');
  }
  if (!isNonBlankString(jwtSecret) || jwtSecret.length < MIN_JWT_SECRET_LENGTH) {
    errors.push(`JWT_SECRET is not set or is shorter than ${MIN_JWT_SECRET_LENGTH} characters`);
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, username, passwordHash, jwtSecret };
}

// Comma-separated exact origins, trimmed; falls back to the local Vite dev
// origin when unset or blank so a fresh dev checkout keeps working with no
// extra configuration.
function loadAllowedOrigins(env = process.env) {
  const raw = env.ALLOWED_ORIGINS;
  if (!isNonBlankString(raw)) {
    return [DEFAULT_ALLOWED_ORIGIN];
  }
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

// Express 5's own "trust proxy" compiler (lib/utils.js#compileTrust): a
// string is split on commas, trimmed, and handed to the `proxy-addr`
// package, which parses each entry as an IP/CIDR or a preset name
// (loopback, linklocal, uniquelocal) and throws on anything else (e.g.
// "invalid IP address: lopback"). Building a throwaway app and calling the
// exact same app.set('trust proxy', ...) app.js will later call exercises
// that real compiler with no dependency on Express's internals, so this
// stays correct across Express versions.
function trustProxyCompileError(value) {
  try {
    express().set('trust proxy', value);
    return null;
  } catch (error) {
    return error.message;
  }
}

// Configures Express's `trust proxy` setting (see
// https://expressjs.com/en/guide/behind-proxies.html) so a deploy behind a
// same-site reverse proxy (the README's "Deploying" note) keys the login
// rate limiter (backend/auth/rateLimiter.js) on the real client instead of
// the shared proxy IP. Returns { valid: true, value } where value is what
// app.set('trust proxy', value) expects, or { valid: false, reason } when
// TRUST_PROXY cannot be used as-is:
//
// - unset/blank, "false" (any case), or "0" all keep today's behavior
//   (false, proxy headers ignored);
// - a positive integer string is a hop count;
// - "true" (any case) is always refused: it tells Express to trust every
//   hop, so any client can set X-Forwarded-For themselves and pick their
//   own rate-limit bucket, defeating the limiter entirely (this is exactly
//   express-rate-limit's own ERR_ERL_PERMISSIVE_TRUST_PROXY warning);
// - anything else must be a comma-separated list of IPs/CIDRs or an
//   Express preset name Express can actually compile (see
//   trustProxyCompileError above) -- an unparseable value (a typo, "1.5",
//   or a list containing either) is refused with Express's own error as
//   the reason, instead of reaching app.set('trust proxy', ...) unvalidated
//   and crashing the process at startup.
//
// The caller (backend/app.js) logs one startup warning with `reason` and
// leaves trust proxy off whenever `valid` is false.
function loadTrustProxy(env = process.env) {
  const raw = env.TRUST_PROXY;
  if (!isNonBlankString(raw)) {
    return { valid: true, value: false };
  }

  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();

  if (lower === 'true') {
    return {
      valid: false,
      reason:
        'TRUST_PROXY=true would trust every hop, letting any client spoof X-Forwarded-For and dodge the login rate limit',
    };
  }
  if (lower === 'false') {
    return { valid: true, value: false };
  }
  if (/^\d+$/.test(trimmed)) {
    const hops = Number(trimmed);
    return { valid: true, value: hops === 0 ? false : hops };
  }

  const compileError = trustProxyCompileError(trimmed);
  if (compileError) {
    return { valid: false, reason: compileError };
  }
  return { valid: true, value: trimmed };
}

module.exports = {
  loadAdminConfig,
  loadAllowedOrigins,
  loadTrustProxy,
  MIN_JWT_SECRET_LENGTH,
  DEFAULT_ALLOWED_ORIGIN,
};
