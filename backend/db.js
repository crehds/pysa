const mongoose = require('mongoose');

const INITIAL_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 30 * 1000;

// The Docker container this app talks to (see docker-compose.yml) is a
// single standalone MongoDB server, not a replica set, so a short
// serverSelectionTimeoutMS is exactly the case Mongoose's own docs
// recommend: "we don't recommend reducing serverSelectionTimeoutMS unless
// you are running a standalone MongoDB server rather than a replica set"
// (https://mongoosejs.com/docs/connections.html#serverselectiontimeoutms).
// It lets each connect() attempt below fail in seconds instead of the 30s
// default, so our own retry loop (not Mongoose, which never retries
// connect() on its own) can take over quickly.
const SERVER_SELECTION_TIMEOUT_MS = 5000;

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

// Removes the uri itself, and specifically its password if it has one,
// from a string before it is ever logged. Defense in depth: neither
// should normally end up in an error's message, but a driver error is
// free-text and not something we control, so this never assumes it is
// already safe to print (see backend/test/db-connect.test.js for a case
// that forces the password into the message directly).
function redact(message, url) {
  if (!message) {
    return message;
  }
  let sanitized = message.split(url).join('<redacted MONGODB_URI>');
  const credentials = /:\/\/[^/@]*:([^/@]*)@/.exec(url);
  if (credentials && credentials[1]) {
    sanitized = sanitized.split(credentials[1]).join('<redacted>');
  }
  return sanitized;
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
  } = {}
) {
  let attempt = 0;
  let delay = INITIAL_RETRY_DELAY_MS;

  for (;;) {
    attempt += 1;
    try {
      await connectFn(url, { serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS });
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
