'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const connect = require('../db');

// Test-only fake scheduler: runs the scheduled callback immediately instead
// of waiting out the real delay, and records every requested delay so tests
// can assert the backoff sequence without slowing the suite down.
function makeFakeScheduler() {
  const delays = [];
  const scheduleFn = (fn, delay) => {
    delays.push(delay);
    fn();
    return { unref() {} };
  };
  scheduleFn.delays = delays;
  return scheduleFn;
}

function noopLogger() {
  return { log() {}, error() {} };
}

test('retries with 1s-doubling backoff until connectFn succeeds, then resolves', async () => {
  let attempts = 0;
  const connectFn = async () => {
    attempts += 1;
    if (attempts <= 2) {
      const error = new Error('connect ECONNREFUSED 127.0.0.1:27017');
      error.name = 'MongooseServerSelectionError';
      throw error;
    }
  };
  const scheduleFn = makeFakeScheduler();

  await connect('mongodb://127.0.0.1:27017/pysa', { connectFn, scheduleFn, logger: noopLogger() });

  assert.equal(attempts, 3);
  assert.deepEqual(scheduleFn.delays, [1000, 2000]);
});

test('logs one concise line per failed attempt (name, message, and retry delay) and one success line, never the URI or credentials', async () => {
  let attempts = 0;
  const connectFn = async () => {
    attempts += 1;
    if (attempts <= 2) {
      const error = new Error('connect ECONNREFUSED 127.0.0.1:27017');
      error.name = 'MongoServerSelectionError';
      error.code = undefined;
      throw error;
    }
  };
  const logs = [];
  const logger = {
    log: (...args) => logs.push(args.join(' ')),
    error: (...args) => logs.push(args.join(' ')),
  };

  await connect('mongodb://admin:s3cr3t@127.0.0.1:27017/pysa?authSource=admin', {
    connectFn,
    scheduleFn: makeFakeScheduler(),
    logger,
  });

  const failureLines = logs.filter((line) => /attempt/i.test(line));
  const successLines = logs.filter((line) => /connect/i.test(line) && !/attempt/i.test(line));
  assert.equal(failureLines.length, 2);
  assert.equal(successLines.length, 1);
  // Attempt number, the error's name and message (distinguishing
  // ECONNREFUSED from a DNS failure or an auth failure), and the delay
  // before retrying are all useful for diagnosing an outage.
  assert.match(failureLines[0], /attempt 1/i);
  assert.match(failureLines[0], /MongoServerSelectionError/);
  assert.match(failureLines[0], /ECONNREFUSED/);
  assert.match(failureLines[0], /1000/);

  for (const line of logs) {
    assert.doesNotMatch(line, /admin|s3cr3t|authSource|mongodb:\/\//i);
  }
});

test('redacts a password even when the driver echoes it back inside error.message itself', async () => {
  const url = 'mongodb://admin:s3cr3t@127.0.0.1:27017/pysa?authSource=admin';
  let attempts = 0;
  const connectFn = async () => {
    attempts += 1;
    if (attempts === 1) {
      // Worst case: the underlying error message repeats the raw URI
      // (with its password) verbatim, e.g. some driver errors do this for
      // unparseable connection strings.
      throw new Error(`bad auth while connecting to ${url}`);
    }
  };
  const logs = [];
  const logger = {
    log: (...args) => logs.push(args.join(' ')),
    error: (...args) => logs.push(args.join(' ')),
  };

  await connect(url, { connectFn, scheduleFn: makeFakeScheduler(), logger });

  assert.ok(logs.length > 0);
  for (const line of logs) {
    assert.doesNotMatch(line, /s3cr3t/);
    assert.doesNotMatch(line, /admin:[^@]*@/);
  }

  const failureLines = logs.filter((line) => /attempt/i.test(line));
  assert.equal(failureLines.length, 1);
  // The rest of the message survives untouched around the marker -- only
  // the URI itself is cut out, nothing else.
  assert.match(failureLines[0], /bad auth while connecting to <redacted MONGODB_URI>/);
});

test('withholds the whole message when the password appears without the surrounding URI, instead of leaving it readable', async () => {
  const url = 'mongodb://admin:s3cr3t@127.0.0.1:27017/pysa?authSource=admin';
  let attempts = 0;
  const connectFn = async () => {
    attempts += 1;
    if (attempts === 1) {
      // Worst case: the driver's own message never contains the whole URI
      // at all (e.g. it already resolved a different host internally),
      // just the bare password -- proving redact() finds the password
      // without needing to match the full URI first.
      throw new Error('bad auth: invalid credentials for password s3cr3t');
    }
  };
  const logs = [];
  const logger = {
    log: (...args) => logs.push(args.join(' ')),
    error: (...args) => logs.push(args.join(' ')),
  };

  await connect(url, { connectFn, scheduleFn: makeFakeScheduler(), logger });

  const failureLines = logs.filter((line) => /attempt/i.test(line));
  assert.equal(failureLines.length, 1);
  assert.doesNotMatch(failureLines[0], /s3cr3t/);
  assert.match(failureLines[0], /message withheld/i);
});

test('withholds the message when it contains the percent-decoded form of a percent-encoded password', async () => {
  const url = 'mongodb://user:p%40ss-word@127.0.0.1:27017/pysa';
  let attempts = 0;
  const connectFn = async () => {
    attempts += 1;
    if (attempts === 1) {
      // Simulates a driver that decodes the URI before echoing the
      // password back: the message holds "p@ss-word", not the raw
      // "p%40ss-word" written in the URI.
      throw new Error('bad auth: invalid credentials for password p@ss-word');
    }
  };
  const logs = [];
  const logger = {
    log: (...args) => logs.push(args.join(' ')),
    error: (...args) => logs.push(args.join(' ')),
  };

  await connect(url, { connectFn, scheduleFn: makeFakeScheduler(), logger });

  const failureLines = logs.filter((line) => /attempt/i.test(line));
  assert.equal(failureLines.length, 1);
  assert.doesNotMatch(failureLines[0], /p@ss-word/);
  assert.match(failureLines[0], /message withheld/i);
});

test('withholds rather than garbles the message when the password is a single common character', async () => {
  const url = 'mongodb://admin:E@127.0.0.1:27017/pysa';
  let attempts = 0;
  const connectFn = async () => {
    attempts += 1;
    if (attempts === 1) {
      const error = new Error('connect ECONNREFUSED 127.0.0.1:27017');
      error.name = 'MongoServerSelectionError';
      throw error;
    }
  };
  const logs = [];
  const logger = {
    log: (...args) => logs.push(args.join(' ')),
    error: (...args) => logs.push(args.join(' ')),
  };

  await connect(url, { connectFn, scheduleFn: makeFakeScheduler(), logger });

  const failureLines = logs.filter((line) => /attempt/i.test(line));
  assert.equal(failureLines.length, 1);
  // Exact match: a one-letter password must never garble unrelated
  // occurrences of that same letter elsewhere in the message (e.g. every
  // "E" in "ECONNREFUSED"), which a plain substring replacement would do.
  assert.equal(
    failureLines[0],
    '[db] connection attempt 1 failed (MongoServerSelectionError): <message withheld: it may contain the MONGODB_URI password>, retrying in 1000ms'
  );
});

test('logs the driver message unchanged, not split into individual characters, when url is empty', async () => {
  let attempts = 0;
  const connectFn = async () => {
    attempts += 1;
    if (attempts === 1) {
      throw new Error('connect ECONNREFUSED 127.0.0.1:27017');
    }
  };
  const logs = [];
  const logger = {
    log: (...args) => logs.push(args.join(' ')),
    error: (...args) => logs.push(args.join(' ')),
  };

  await connect('', { connectFn, scheduleFn: makeFakeScheduler(), logger });

  const failureLines = logs.filter((line) => /attempt/i.test(line));
  assert.equal(failureLines.length, 1);
  assert.match(failureLines[0], /connect ECONNREFUSED 127\.0\.0\.1:27017/);
});

test('stops retrying on a non-retryable error (e.g. a malformed MONGODB_URI) instead of retrying forever', async () => {
  let attempts = 0;
  const connectFn = async () => {
    attempts += 1;
    const error = new Error(
      'Invalid scheme, expected connection string to start with "mongodb://" or "mongodb+srv://"'
    );
    error.name = 'MongoParseError';
    throw error;
  };
  const scheduleFn = makeFakeScheduler();
  const logs = [];
  const logger = {
    log: (...args) => logs.push(args.join(' ')),
    error: (...args) => logs.push(args.join(' ')),
  };

  await connect('not-a-valid-uri', { connectFn, scheduleFn, logger });

  assert.equal(attempts, 1);
  assert.deepEqual(scheduleFn.delays, []);
  assert.equal(logs.length, 1);
  assert.match(logs[0], /MongoParseError/);
  assert.match(logs[0], /not retrying/i);
  // Distinct from the transient-failure phrasing ("retrying in <N>ms"),
  // which would wrongly imply this will be tried again.
  assert.doesNotMatch(logs[0], /retrying in \d/i);
});

test('caps the retry delay at 30s once the 1s-doubling sequence would exceed it', async () => {
  let attempts = 0;
  const connectFn = async () => {
    attempts += 1;
    if (attempts <= 6) {
      throw new Error('still down');
    }
  };
  const scheduleFn = makeFakeScheduler();

  await connect('mongodb://127.0.0.1:27017/pysa', { connectFn, scheduleFn, logger: noopLogger() });

  assert.deepEqual(scheduleFn.delays, [1000, 2000, 4000, 8000, 16000, 30000]);
});

test('resolves immediately with no retry when the first attempt succeeds', async () => {
  let attempts = 0;
  const connectFn = async () => {
    attempts += 1;
  };
  const scheduleFn = makeFakeScheduler();

  await connect('mongodb://127.0.0.1:27017/pysa', { connectFn, scheduleFn, logger: noopLogger() });

  assert.equal(attempts, 1);
  assert.deepEqual(scheduleFn.delays, []);
});

test('omits serverSelectionTimeoutMS when MONGODB_SERVER_SELECTION_TIMEOUT_MS is unset, so the MongoDB driver default (30000ms, safe for a replica set) applies', async () => {
  let seenOptions;
  const connectFn = async (url, options) => {
    seenOptions = options;
  };

  await connect('mongodb://127.0.0.1:27017/pysa', {
    connectFn,
    scheduleFn: makeFakeScheduler(),
    logger: noopLogger(),
    env: {},
  });

  assert.equal('serverSelectionTimeoutMS' in seenOptions, false);
});

test('omits serverSelectionTimeoutMS when MONGODB_SERVER_SELECTION_TIMEOUT_MS is blank', async () => {
  let seenOptions;
  const connectFn = async (url, options) => {
    seenOptions = options;
  };

  await connect('mongodb://127.0.0.1:27017/pysa', {
    connectFn,
    scheduleFn: makeFakeScheduler(),
    logger: noopLogger(),
    env: { MONGODB_SERVER_SELECTION_TIMEOUT_MS: '   ' },
  });

  assert.equal('serverSelectionTimeoutMS' in seenOptions, false);
});

test('passes MONGODB_SERVER_SELECTION_TIMEOUT_MS through as serverSelectionTimeoutMS so local dev can still fail fast (standalone Mongo, our own loop owns backoff)', async () => {
  let seenOptions;
  const connectFn = async (url, options) => {
    seenOptions = options;
  };

  await connect('mongodb://127.0.0.1:27017/pysa', {
    connectFn,
    scheduleFn: makeFakeScheduler(),
    logger: noopLogger(),
    env: { MONGODB_SERVER_SELECTION_TIMEOUT_MS: '5000' },
  });

  assert.equal(seenOptions.serverSelectionTimeoutMS, 5000);
});

test('warns once and omits serverSelectionTimeoutMS when MONGODB_SERVER_SELECTION_TIMEOUT_MS is invalid, instead of crashing', async () => {
  let seenOptions;
  const connectFn = async (url, options) => {
    seenOptions = options;
  };
  const warnings = [];
  const logger = {
    log() {},
    error: (...args) => warnings.push(args.join(' ')),
  };

  await connect('mongodb://127.0.0.1:27017/pysa', {
    connectFn,
    scheduleFn: makeFakeScheduler(),
    logger,
    env: { MONGODB_SERVER_SELECTION_TIMEOUT_MS: 'not-a-number' },
  });

  assert.equal('serverSelectionTimeoutMS' in seenOptions, false);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /MONGODB_SERVER_SELECTION_TIMEOUT_MS/);
});

test('unrefs the real retry timer so a failed connection can never keep a process alive', () => {
  // Exercises the real setTimeout-based default scheduler directly and
  // asserts the unref'd property itself (Timeout#hasRef()), rather than
  // awaiting a real delay: awaiting the timer's own callback would pass the
  // same way whether or not unref() ran (the event loop keeps spinning for
  // the await regardless), so that only proved the retry eventually fires,
  // never that it was actually unref'd.
  const timer = connect.scheduleRetry(() => {}, 1000);
  try {
    assert.equal(timer.hasRef(), false);
  } finally {
    clearTimeout(timer);
  }
});
