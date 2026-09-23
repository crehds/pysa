'use strict';

const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app, disconnect } = require('../support/testEnv');

// Never reached by a handler (requireAdmin rejects first), so any
// well-formed placeholder works.
const PLACEHOLDER_ID = '000000000000000000000000';

// Authoritative enumeration of every state-changing route in
// backend/components/*/network.js (see the report for the full
// protected-vs-public table). Keep this in sync with routes/index.js and
// each component's network.js when a route is added, removed, or
// reclassified.
const PROTECTED_WRITE_ROUTES = [
  ['post', '/players/newplayer'],
  ['post', '/players/newPlayers'],
  ['post', '/players/addNewPlayers'],
  ['post', '/players/playersWithAllData'],
  ['post', `/players/updateImage/${PLACEHOLDER_ID}`],
  ['patch', `/players/setNotCalibrated/${PLACEHOLDER_ID}`],
  ['patch', `/players/updateScore/${PLACEHOLDER_ID}`],
  ['patch', `/players/patchPlayer/${PLACEHOLDER_ID}/updateMedail/${PLACEHOLDER_ID}`],
  ['delete', '/players/deleteAllDataOfPlayers'],
  ['delete', '/players/deleteAll'],
  ['post', '/medails/setMedails'],
  ['patch', `/medails/patchMedail/${PLACEHOLDER_ID}`],
  ['post', `/scores/setScoreOfOnePlayer/${PLACEHOLDER_ID}`],
  ['put', `/scores/setScoreOfOnePlayer/${PLACEHOLDER_ID}`],
  ['delete', `/scores/deleteOne/${PLACEHOLDER_ID}`],
  ['delete', '/scores/deleteAll'],
  ['post', '/roles/setRoles'],
  ['post', `/calibrations/addCalibration/${PLACEHOLDER_ID}`],
  ['patch', `/calibrations/patchCalibration/${PLACEHOLDER_ID}`],
  ['delete', '/calibrations/deleteAll'],
];

for (const [method, routePath] of PROTECTED_WRITE_ROUTES) {
  test(`${method.toUpperCase()} ${routePath} rejects an anonymous request with a generic 401`, async () => {
    const res = await request(app)[method](routePath).send({});
    assert.equal(res.status, 401);
    assert.equal(res.body.error, 'Not authorized');
  });
}

test('POST /scores/getScoreOfPlayers stays public: an anonymous request is never 401', async () => {
  // The one write route the public pages call directly
  // (client/src/hooks/useGetData.js) and must keep working unauthenticated.
  const res = await request(app).post('/scores/getScoreOfPlayers').send({ playersIds: [] });
  assert.notEqual(res.status, 401);
});

test('a tampered session cookie is rejected on a real protected route, not just in isolation', async () => {
  const { SESSION_COOKIE_NAME } = require('../auth/tokens');
  const res = await request(app)
    .post('/roles/setRoles')
    .set('Cookie', `${SESSION_COOKIE_NAME}=not-a-real-token`)
    .send({ roles: [{ name: 'carry' }] });
  assert.equal(res.status, 401);
});

after(disconnect);
