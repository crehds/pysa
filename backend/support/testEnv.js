'use strict';

// Shared test bootstrap. NOT placed under test/ on purpose: node --test treats
// every file inside a directory named "test" as a test file, and this module
// has no test() calls of its own.
//
// Safety: point MONGODB_URI at a database whose name ends with "_test" BEFORE
// requiring app.js, so tests can never run against a real/dev database.

const TEST_MONGODB_URI =
  process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/pysa_test';

const dbName = TEST_MONGODB_URI.split('/').pop().split('?')[0];
if (!dbName.endsWith('_test')) {
  throw new Error(
    `Refusing to run tests against database "${dbName}": TEST_MONGODB_URI must ` +
      'point to a database whose name ends with "_test".'
  );
}

process.env.MONGODB_URI = TEST_MONGODB_URI;

const mongoose = require('mongoose');
const app = require('../app');

// mongoose.connection.asPromise() only exists from Mongoose 6 on, so use the
// readyState/event API that has been stable since Mongoose 5 to stay
// compatible with the pre-upgrade characterization run.
function waitForConnection() {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    mongoose.connection.once('connected', resolve);
    mongoose.connection.once('error', reject);
  });
}

async function resetDatabase() {
  await waitForConnection();
  await mongoose.connection.dropDatabase();
}

async function disconnect() {
  await mongoose.disconnect();
}

// Polls until conditionFn() resolves to a truthy value, or throws on timeout.
// Used only where the current implementation does not await its own writes
// (see the setMedails bug noted in the report).
async function waitFor(conditionFn, { timeoutMs = 2000, intervalMs = 50 } = {}) {
  const start = Date.now();
  for (;;) {
    const value = await conditionFn();
    if (value) return value;
    if (Date.now() - start > timeoutMs) {
      throw new Error('Timed out waiting for condition');
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

module.exports = { app, mongoose, resetDatabase, disconnect, waitFor, TEST_MONGODB_URI };
