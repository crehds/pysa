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

test('passes a short serverSelectionTimeoutMS to connectFn so each attempt fails fast (standalone Mongo, our own loop owns backoff)', async () => {
  let seenOptions;
  const connectFn = async (url, options) => {
    seenOptions = options;
  };

  await connect('mongodb://127.0.0.1:27017/pysa', {
    connectFn,
    scheduleFn: makeFakeScheduler(),
    logger: noopLogger(),
  });

  assert.equal(typeof seenOptions.serverSelectionTimeoutMS, 'number');
  assert.ok(seenOptions.serverSelectionTimeoutMS > 0);
  assert.ok(seenOptions.serverSelectionTimeoutMS <= 10000);
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
