'use strict';

// Loads and validates the admin login configuration from environment
// variables. Pure and side-effect-free (no console output, no caching) so
// callers can log a startup warning exactly once at their own boundary and
// tests can exercise every combination with plain objects instead of
// mutating process.env.

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

// Configures Express's `trust proxy` setting (see
// https://expressjs.com/en/guide/behind-proxies.html) so a deploy behind a
// same-site reverse proxy (the README's "Deploying" note) keys the login
// rate limiter (backend/auth/rateLimiter.js) on the real client instead of
// the shared proxy IP. Returns { valid: true, value } where value is what
// app.set('trust proxy', value) expects: unset/blank keeps today's
// behavior (false, proxy headers ignored); a non-negative integer string
// is a hop count; anything else is passed through trimmed as a
// comma-separated list of IPs/CIDRs or an Express preset name (loopback,
// linklocal, uniquelocal).
//
// `true` (any case) is always refused as { valid: false }: it tells
// Express to trust every hop, so any client can set X-Forwarded-For
// themselves and pick their own rate-limit bucket, defeating the limiter
// entirely (this is exactly express-rate-limit's own
// ERR_ERL_PERMISSIVE_TRUST_PROXY warning). The caller logs a startup
// warning and leaves trust proxy off in that case.
function loadTrustProxy(env = process.env) {
  const raw = env.TRUST_PROXY;
  if (!isNonBlankString(raw)) {
    return { valid: true, value: false };
  }

  const trimmed = raw.trim();
  if (trimmed.toLowerCase() === 'true') {
    return { valid: false };
  }
  if (/^\d+$/.test(trimmed)) {
    return { valid: true, value: Number(trimmed) };
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
