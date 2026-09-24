'use strict';

const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { mongoose, resetDatabase, disconnect, loginAsAdmin } = require('../support/testEnv');
const ScoreModel = require('../components/score/model');

test('scores: deleteAll removes every score', async () => {
  await resetDatabase();
  const agent = await loginAsAdmin();

  await agent.post('/roles/setRoles').send({ roles: [{ name: 'carry' }] });

  const playerId = new mongoose.Types.ObjectId().toString();
  await agent
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

  const res = await agent.delete('/scores/deleteAll');
  assert.equal(res.status, 200);
  assert.equal(res.body.error, '');
  assert.equal(await ScoreModel.countDocuments(), 0);
});

after(disconnect);
