'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

test('app.js refuses to load when MONGODB_URI is not set', () => {
  const backendDir = path.join(__dirname, '..');
  const env = { ...process.env };
  delete env.MONGODB_URI;

  const result = spawnSync(process.execPath, ['-e', "require('./app')"], {
    cwd: backendDir,
    env,
    encoding: 'utf8',
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /MONGODB_URI is not set/);
});

test('app.js does not crash when admin env vars are missing; it warns once and stays up', () => {
  const backendDir = path.join(__dirname, '..');
  const env = { ...process.env, MONGODB_URI: 'mongodb://127.0.0.1:27017/pysa_test' };
  delete env.ADMIN_USERNAME;
  delete env.ADMIN_PASSWORD_HASH;
  delete env.JWT_SECRET;

  // Exits right after require() resolves, before any Mongo connection
  // attempt settles: this test only cares that loading the module itself
  // never throws when the admin vars are absent, matching "fail closed
  // without taking the public site down" rather than a startup crash.
  const result = spawnSync(
    process.execPath,
    ['-e', "require('./app'); process.exit(0);"],
    { cwd: backendDir, env, encoding: 'utf8' }
  );

  assert.equal(result.status, 0);
  assert.match(result.stderr, /admin login is not configured/i);
});
