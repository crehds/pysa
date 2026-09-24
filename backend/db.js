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

function scheduleRetry(fn, delay) {
  const timer = setTimeout(fn, delay);
  // Never let a pending retry keep the process (or a test) alive on its own.
  timer.unref();
  return timer;
}

// Connects to MongoDB, retrying with exponential backoff (1s, doubling,
// capped at 30s, no attempt limit) instead of giving up after one failure.
// Without this, starting the backend before MongoDB is up (e.g. `npm run
// dev` racing `docker compose up`) left the API listening but every query
// buffering and then failing until a manual restart, because Mongoose does
// not retry a failed initial connect() itself.
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
      // try, and the error's name/code are enough to diagnose an outage.
      const code = error && error.code ? `/${error.code}` : '';
      logger.error(
        `[db] connection attempt ${attempt} failed (${error && error.name}${code}), retrying in ${delay}ms`
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
