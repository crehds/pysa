'use strict';

const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app, resetDatabase, disconnect, waitFor } = require('../support/testEnv');

test('medails: setMedails, getMedails, getMedail, getMedailByMMR, patchMedail', async (t) => {
  await resetDatabase();

  await t.test('POST /medails/setMedails accepts the payload', async () => {
    const res = await request(app)
      .post('/medails/setMedails')
      .send({
        medails: [
          { nombre: 'Bronze', minimo: 0, maximo: 1999 },
          { nombre: 'Silver', minimo: 2000, maximo: 3999 },
        ],
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.error, '');
    // Known bug (not fixed on this branch, see report): addMedails() never
    // returns or awaits the saved documents, so the response body is always
    // empty even though the writes are queued in the background.
    assert.equal(res.body.body, undefined);
  });

  let seeded;
  await t.test('the medails eventually persist', async () => {
    seeded = await waitFor(async () => {
      const res = await request(app).get('/medails/getMedails');
      return res.body.body.length === 2 ? res.body.body : null;
    });
    const names = seeded.map((medail) => medail.name).sort();
    assert.deepEqual(names, ['Bronze', 'Silver']);
  });

  await t.test('GET /medails/getMedail/:id returns one medail', async () => {
    const target = seeded.find((medail) => medail.name === 'Bronze');
    const res = await request(app).get(`/medails/getMedail/${target._id}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.error, '');
    assert.equal(res.body.body.name, 'Bronze');
    assert.equal(res.body.body.minimo, 0);
    assert.equal(res.body.body.maximo, 1999);
  });

  await t.test('GET /medails/getMedailByMMR/:MMR returns the matching medail id', async () => {
    const target = seeded.find((medail) => medail.name === 'Silver');
    const res = await request(app).get('/medails/getMedailByMMR/2500');
    assert.equal(res.status, 200);
    assert.equal(res.body.error, '');
    assert.equal(res.body.body, target._id);
  });

  await t.test('PATCH /medails/patchMedail/:id updates the medail', async () => {
    const target = seeded.find((medail) => medail.name === 'Bronze');
    const res = await request(app)
      .patch(`/medails/patchMedail/${target._id}`)
      .send({ medail: { name: 'Wood' } });

    assert.equal(res.status, 200);
    assert.equal(res.body.error, '');

    const check = await request(app).get(`/medails/getMedail/${target._id}`);
    assert.equal(check.body.body.name, 'Wood');
  });
});

after(disconnect);
