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

function waitForConnection(timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(
        new Error(`Timed out waiting for the mongoose connection after ${timeoutMs}ms`)
      );
    }, timeoutMs);
    // Only the wait itself should hold the process open, never this timer.
    timer.unref?.();

    mongoose.connection
      .asPromise()
      .then((connection) => {
        clearTimeout(timer);
        resolve(connection);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

async function resetDatabase() {
  await waitForConnection();
  await mongoose.connection.dropDatabase();
}

async function disconnect() {
  await mongoose.disconnect();
}

module.exports = { app, mongoose, resetDatabase, disconnect, TEST_MONGODB_URI };
