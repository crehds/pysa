'use strict';

const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app, mongoose, resetDatabase, disconnect } = require('../support/testEnv');

test('calibration: add, get, patch', async (t) => {
  await resetDatabase();

  const playerId = new mongoose.Types.ObjectId().toString();

  await t.test('POST /calibrations/addCalibration/:playerId creates a calibration', async () => {
    const res = await request(app)
      .post(`/calibrations/addCalibration/${playerId}`)
      .send({ estado: true, remainingGames: 5, initialMMR: 1500 });

    assert.equal(res.status, 200);
    assert.equal(res.body.error, '');
    assert.equal(res.body.body.remainingGames, 5);
    assert.equal(res.body.body.initialMMR, 1500);
  });

  await t.test('GET /calibrations/getCalibrationOfOnePlayer/:playerId reads it back', async () => {
    const res = await request(app).get(
      `/calibrations/getCalibrationOfOnePlayer/${playerId}`
    );

    assert.equal(res.status, 200);
    assert.equal(res.body.error, '');
    assert.equal(res.body.body.remainingGames, 5);
    assert.equal(res.body.body.initialMMR, 1500);
  });

  await t.test('PATCH /calibrations/patchCalibration/:playerId updates it', async () => {
    const res = await request(app)
      .patch(`/calibrations/patchCalibration/${playerId}`)
      .send({ remainingGames: 3 });

    assert.equal(res.status, 200);
    assert.equal(res.body.error, '');
    assert.equal(res.body.body.remainingGames, 3);

    const check = await request(app).get(
      `/calibrations/getCalibrationOfOnePlayer/${playerId}`
    );
    assert.equal(check.body.body.remainingGames, 3);
  });
});

after(disconnect);
