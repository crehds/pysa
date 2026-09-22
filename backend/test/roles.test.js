'use strict';

const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app, resetDatabase, disconnect } = require('../support/testEnv');

test('roles: setRoles then getRoles', async (t) => {
  await resetDatabase();

  await t.test('GET /roles/getRoles starts empty', async () => {
    const res = await request(app).get('/roles/getRoles');
    assert.equal(res.status, 200);
    assert.equal(res.body.error, '');
    assert.deepEqual(res.body.body, []);
  });

  let created;
  await t.test('POST /roles/setRoles creates roles', async () => {
    const res = await request(app)
      .post('/roles/setRoles')
      .send({ roles: [{ name: 'carry' }, { name: 'support' }] });

    assert.equal(res.status, 201);
    assert.equal(res.body.error, '');
    assert.equal(res.body.body.length, 2);
    for (const role of res.body.body) {
      assert.equal(typeof role._id, 'string');
      assert.ok(['carry', 'support'].includes(role.name));
    }
    created = res.body.body;
  });

  await t.test('GET /roles/getRoles reflects the created roles', async () => {
    const res = await request(app).get('/roles/getRoles');
    assert.equal(res.status, 200);
    assert.equal(res.body.body.length, 2);
    const names = res.body.body.map((role) => role.name).sort();
    assert.deepEqual(names, ['carry', 'support']);
    const ids = res.body.body.map((role) => role._id).sort();
    assert.deepEqual(ids, created.map((role) => role._id).sort());
  });
});

after(disconnect);
