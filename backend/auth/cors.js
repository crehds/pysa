'use strict';

// Exact-match allowlist: no wildcards, no substring/prefix matching. A
// request with no Origin header (curl, server-to-server, same-origin) is
// allowed through, since the browser only sends Origin on cross-origin
// requests in the first place.
function isAllowedOrigin(origin, allowedOrigins) {
  if (!origin) {
    return true;
  }
  return allowedOrigins.includes(origin);
}

// Options object for the `cors` package. A disallowed origin resolves with
// `false` (not an Error), so the request still completes but without any
// Access-Control-* headers, matching "a disallowed origin gets no CORS
// headers" rather than a 500.
function createCorsOptions(allowedOrigins) {
  return {
    origin(origin, callback) {
      callback(null, isAllowedOrigin(origin, allowedOrigins));
    },
    credentials: true,
  };
}

module.exports = { isAllowedOrigin, createCorsOptions };
