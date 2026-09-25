const mongoose = require('mongoose');

const INITIAL_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 30 * 1000;

// serverSelectionTimeoutMS is client-wide: the driver applies it to every
// operation's server selection (node_modules/mongodb/lib/sdam/topology.js,
// selectServer()), not just the initial connect(). A short value is only
// safe against the single standalone MongoDB server this app talks to
// locally in Docker (see docker-compose.yml) -- on a replica set (e.g.
// MongoDB Atlas in production), a primary election taking longer than the
// timeout would turn every query issued during it into an error. So this
// stays unset in production and falls back to the driver's own default
// (30000ms, confirmed in node_modules/mongodb/lib/connection_string.js);
// only local dev opts into a short one via MONGODB_SERVER_SELECTION_TIMEOUT_MS
// (see README) so a connect() attempt below fails in seconds instead of 30s,
// letting our own retry loop (not Mongoose, which never retries connect() on
// its own) take over quickly.
//
// Returns { valid: true, value } where value is undefined when the env var
// is unset/blank (the caller omits the option entirely) or the parsed
// positive integer otherwise, or { valid: false, reason } when it is set to
// something else -- the caller logs `reason` and falls back to the driver
// default rather than crash, the same fail-closed style as TRUST_PROXY
// (backend/auth/config.js).
function loadServerSelectionTimeoutMs(env = process.env) {
  const raw = env.MONGODB_SERVER_SELECTION_TIMEOUT_MS;
  if (typeof raw !== 'string' || raw.trim() === '') {
    return { valid: true, value: undefined };
  }

  const trimmed = raw.trim();
  if (/^\d+$/.test(trimmed) && Number(trimmed) > 0) {
    return { valid: true, value: Number(trimmed) };
  }

  return {
    valid: false,
    reason: `MONGODB_SERVER_SELECTION_TIMEOUT_MS must be a positive integer, got "${raw}"`,
  };
}

// Confirmed via the MongoDB Node driver empirically (a malformed
// MONGODB_URI, e.g. missing the mongodb:// scheme, rejects with this exact
// error name): a URI parse failure can never succeed no matter how many
// times we retry the very same string, so it is treated as permanent
// instead of retried forever.
//
// Authentication failures are deliberately NOT included here, even though
// they are just as permanent in practice. Mongoose's own docs
// (https://mongoosejs.com/docs/connections.html#error-handling and
// #server-selection) show a bad password surfaces as the *same*
// MongooseServerSelectionError/MongoTimeoutError a plain connectivity
// outage produces; the actual "Authentication failed" cause is buried
// inside `error.reason` (a topology-description object you'd have to walk
// server by server), not a distinct top-level name or code. That is not a
// reliable enough signal to safely stop retrying on -- misreading it would
// mean giving up permanently on what might really be a transient outage.
const NON_RETRYABLE_ERROR_NAMES = new Set(['MongoParseError']);

function isNonRetryable(error) {
  return Boolean(error) && NON_RETRYABLE_ERROR_NAMES.has(error.name);
}

function scheduleRetry(fn, delay) {
  const timer = setTimeout(fn, delay);
  // Never let a pending retry keep the process (or a test) alive on its own.
  timer.unref();
  return timer;
}

// Logged in place of a driver message that may contain the MongoDB password.
// It is a constant, never built from the message, so it cannot leak any of it.
const WITHHELD_MESSAGE = '<message withheld: it may contain the MONGODB_URI password>';

// Makes a driver error's message safe to log. The message is free text we
// do not control, so it is never assumed to be safe already:
// - every copy of the full URI is replaced with "<redacted MONGODB_URI>";
// - if the rest of the message still contains the password, raw or
//   percent-decoded (the URI spells "p@ss" as "p%40ss", and a driver may
//   echo either), the whole message is withheld instead. Cutting just the
//   password out would garble the line whenever it is short or common: a
//   password "E" would turn "connect ECONNREFUSED" into
//   "connect <redacted>CONNR<redacted>FUS<redacted>D". connect() still logs
//   the error's name and code, which is usually enough to diagnose an outage.
// The password check runs on the message text alone, before the URI marker
// is joined back in, so the marker itself can never cause a false match.
// backend/test/db-connect.test.js covers each of these cases.
function redact(message, url) {
  if (!message) {
    return message;
  }

  // An empty url is skipped: split('') would break the message into single
  // characters.
  const pieces = typeof url === 'string' && url ? message.split(url) : [message];

  const credentials = /:\/\/[^/@]*:([^/@]*)@/.exec(url);
  const passwordForms = [];
  if (credentials && credentials[1]) {
    const rawPassword = credentials[1];
    passwordForms.push(rawPassword);
    try {
      const decodedPassword = decodeURIComponent(rawPassword);
      if (decodedPassword && decodedPassword !== rawPassword) {
        passwordForms.push(decodedPassword);
      }
    } catch {
      // Malformed percent-encoding (e.g. a lone "%"): decodeURIComponent
      // throws URIError. The raw form above is still checked, so this only
      // gives up on the decoded form, never on redaction itself.
    }
  }

  const mayContainPassword = pieces.some((piece) =>
    passwordForms.some((password) => piece.includes(password))
  );
  if (mayContainPassword) {
    return WITHHELD_MESSAGE;
  }

  return pieces.join('<redacted MONGODB_URI>');
}

// Connects to MongoDB, retrying with exponential backoff (1s, doubling,
// capped at 30s) instead of giving up after one failure. Without this,
// starting the backend before MongoDB is up (e.g. `npm run dev` racing
// `docker compose up`) left the API listening but every query buffering
// and then failing until a manual restart, because Mongoose does not
// retry a failed initial connect() itself.
//
// Retrying is skipped for an error that no amount of retrying can fix (see
// isNonRetryable above): the process stays up either way (never rethrown),
// matching how backend/app.js already treats other startup misconfigurations
// (e.g. a missing admin var) -- fail closed and keep serving what still
// works, with one clear log line an operator can act on, rather than
// crashing the whole API over a config problem a restart alone cannot fix.
//
// connectFn/scheduleFn/logger are injectable so tests can exercise the
// retry/backoff/logging behavior with fakes instead of a real socket and
// real timers (see backend/test/db-connect.test.js).
async function connect(
  url,
  {
    connectFn = (u, options) => mongoose.connect(u, options),
    scheduleFn = scheduleRetry,
    logger = console,
    env = process.env,
  } = {}
) {
  const timeout = loadServerSelectionTimeoutMs(env);
  if (!timeout.valid) {
    logger.error(`[db] ${timeout.reason}; using the MongoDB driver's own default instead.`);
  }
  const connectOptions = {};
  if (timeout.valid && timeout.value !== undefined) {
    connectOptions.serverSelectionTimeoutMS = timeout.value;
  }

  let attempt = 0;
  let delay = INITIAL_RETRY_DELAY_MS;

  for (;;) {
    attempt += 1;
    try {
      await connectFn(url, connectOptions);
      logger.log('[db] connected');
      return;
    } catch (error) {
      // Never log the uri (or anything derived from it): at deploy it
      // embeds credentials. The attempt number, the delay before the next
      // try, and the error's name/message (redacted) are enough to
      // diagnose an outage without ever risking a leaked password.
      const code = error && error.code ? `/${error.code}` : '';
      const message = redact(error && error.message, url);

      if (isNonRetryable(error)) {
        logger.error(
          `[db] connection failed permanently (${error && error.name}${code}): ${message}. ` +
            'Not retrying: fix MONGODB_URI and restart the backend.'
        );
        return;
      }

      logger.error(
        `[db] connection attempt ${attempt} failed (${error && error.name}${code}): ${message}, retrying in ${delay}ms`
      );
      await new Promise((resolve) => scheduleFn(resolve, delay));
      delay = Math.min(delay * 2, MAX_RETRY_DELAY_MS);
    }
  }
}

module.exports = connect;
// Exposed so backend/test/db-connect.test.js can assert the real default
// scheduler's timer is actually unref'd, instead of only awaiting a real
// 1s delay (which passes the same way whether or not unref() ran, and
// leaves node --test racing its own idle-handle check under load).
module.exports.scheduleRetry = scheduleRetry;
