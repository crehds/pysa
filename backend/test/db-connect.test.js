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

test('logs one concise line per failed attempt and one success line, never the URI or credentials', async () => {
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
  // Attempt number and the delay before retrying are useful; the error's
  // name identifies what went wrong without ever touching the URI.
  assert.match(failureLines[0], /attempt 1/i);
  assert.match(failureLines[0], /MongoServerSelectionError/);
  assert.match(failureLines[0], /1000/);

  for (const line of logs) {
    assert.doesNotMatch(line, /admin|s3cr3t|authSource|mongodb:\/\//i);
  }
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

test('unrefs the real retry timer so a failed connection can never keep a process alive', async () => {
  let attempts = 0;
  const connectFn = async () => {
    attempts += 1;
    if (attempts === 1) {
      throw new Error('down');
    }
  };

  // No scheduleFn override here: this exercises the real setTimeout-based
  // default. If it were not unref()'d, this single retry (1s) would still
  // complete, but a never-succeeding connection would hang the process
  // instead of letting node --test exit on its own.
  await connect('mongodb://127.0.0.1:27017/pysa', { connectFn, logger: noopLogger() });

  assert.equal(attempts, 2);
});
