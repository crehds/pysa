'use strict';

const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app, resetDatabase, disconnect, loginAsAdmin } = require('../support/testEnv');

test('medails: setMedails, getMedails, getMedail, getMedailByMMR, patchMedail', async (t) => {
  await resetDatabase();
  const agent = await loginAsAdmin();

  let seeded;
  await t.test('POST /medails/setMedails saves and returns the medails', async () => {
    const res = await agent
      .post('/medails/setMedails')
      .send({
        medails: [
          { nombre: 'Bronze', minimo: 0, maximo: 1999 },
          { nombre: 'Silver', minimo: 2000, maximo: 3999 },
        ],
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.error, '');
    assert.equal(res.body.body.length, 2);
    seeded = res.body.body;
    const names = seeded.map((medail) => medail.name).sort();
    assert.deepEqual(names, ['Bronze', 'Silver']);
  });

  await t.test('the medails persist', async () => {
    const res = await request(app).get('/medails/getMedails');
    assert.equal(res.status, 200);
    assert.equal(res.body.body.length, 2);
    const names = res.body.body.map((medail) => medail.name).sort();
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

  await t.test('GET /medails/getMedailByMMR/:MMR answers 404 when no medail matches', async () => {
    const res = await request(app).get('/medails/getMedailByMMR/999999');
    assert.equal(res.status, 404);
    assert.equal(res.body.body, '');
    assert.match(res.body.error, /999999/);
  });

  await t.test('PATCH /medails/patchMedail/:id updates the medail', async () => {
    const target = seeded.find((medail) => medail.name === 'Bronze');
    const res = await agent
      .patch(`/medails/patchMedail/${target._id}`)
      .send({ medail: { name: 'Wood' } });

    assert.equal(res.status, 200);
    assert.equal(res.body.error, '');

    const check = await request(app).get(`/medails/getMedail/${target._id}`);
    assert.equal(check.body.body.name, 'Wood');
  });
});

after(disconnect);
