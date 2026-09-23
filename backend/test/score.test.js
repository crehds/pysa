'use strict';

const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app, mongoose, resetDatabase, disconnect } = require('../support/testEnv');
const ScoreModel = require('../components/score/model');

test('scores: deleteAll removes every score', async () => {
  await resetDatabase();

  await request(app).post('/roles/setRoles').send({ roles: [{ name: 'carry' }] });

  const playerId = new mongoose.Types.ObjectId().toString();
  await request(app)
    .post(`/scores/setScoreOfOnePlayer/${playerId}`)
    .send({
      rolesScore: [
        {
          name: 'carry',
          score: {
            victories: 1,
            victoriesDouble: 0,
            defeats: 0,
            defeatsDouble: 0,
            kills: 5,
            deaths: 2,
            assists: 3,
          },
        },
      ],
    });
  assert.equal(await ScoreModel.countDocuments(), 1);

  const res = await request(app).delete('/scores/deleteAll');
  assert.equal(res.status, 200);
  assert.equal(res.body.error, '');
  assert.equal(await ScoreModel.countDocuments(), 0);
});

after(disconnect);
