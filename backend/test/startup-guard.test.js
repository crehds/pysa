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
