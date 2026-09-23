'use strict';

const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const request = require('supertest');
const { app, resetDatabase, disconnect } = require('../support/testEnv');

function roleScore(overrides) {
  return {
    victories: 1,
    victoriesDouble: 0,
    defeats: 0,
    defeatsDouble: 0,
    kills: 5,
    deaths: 2,
    assists: 3,
    ...overrides,
  };
}

test('players: addNewPlayers -> getAllPlayers -> getScoreOfPlayers -> onePlayer -> updateScore -> updateImage -> deleteAllDataOfPlayers', async (t) => {
  await resetDatabase();

  await request(app)
    .post('/roles/setRoles')
    .send({ roles: [{ name: 'carry' }, { name: 'support' }] });

  const setMedails = await request(app)
    .post('/medails/setMedails')
    .send({
      medails: [
        { nombre: 'Bronze', minimo: 0, maximo: 1999 },
        { nombre: 'Silver', minimo: 2000, maximo: 3999 },
      ],
    });

  const bronze = setMedails.body.body.find((medail) => medail.name === 'Bronze');

  const playerNoMedail = {
    name: { firstName: 'Ana', lastName: 'Gomez' },
    nickname: 'anag',
    mmr: 500,
    estado: true,
    medail: null,
    calibration: { estado: true, remainingGames: 5, initialMMR: 500 },
    rolesScore: [
      { name: 'carry', score: roleScore({ kills: 5 }) },
      { name: 'support', score: roleScore({ kills: 1, assists: 9 }) },
    ],
  };
  const playerWithMedail = {
    name: { firstName: 'Beto', lastName: 'Diaz' },
    nickname: 'betod',
    mmr: 500,
    estado: true,
    medail: bronze._id,
    calibration: { estado: true, remainingGames: 5, initialMMR: 500 },
    rolesScore: [
      { name: 'carry', score: roleScore({ kills: 7 }) },
      { name: 'support', score: roleScore({ kills: 2, assists: 4 }) },
    ],
  };

  let playerAId;
  let playerBId;

  await t.test('POST /players/addNewPlayers creates both players', async () => {
    const res = await request(app)
      .post('/players/addNewPlayers')
      .send({ players: [playerNoMedail, playerWithMedail] });

    assert.equal(res.status, 200);
    assert.equal(res.body.error, '');
    assert.equal(res.body.body.length, 2);

    const [savedA, savedB] = res.body.body;
    // Reading through ._doc pins the current client contract: the frontend
    // reads body[]._doc, so these Mongoose-document internals must keep
    // showing up in the response exactly as they do today.
    assert.equal(savedA._doc.nickname, 'anag');
    assert.equal(savedB._doc.nickname, 'betod');
    assert.equal(savedA.rolesScore.length, 2);
    assert.equal(savedB.rolesScore.length, 2);
    assert.ok(savedA.calibration);
    assert.ok(savedB.calibration);

    playerAId = savedA._doc._id;
    playerBId = savedB._doc._id;
    assert.equal(typeof playerAId, 'string');
    assert.equal(typeof playerBId, 'string');
  });

  await t.test('GET /players/getAllPlayers lists both players', async () => {
    const res = await request(app).get('/players/getAllPlayers');
    assert.equal(res.status, 200);
    assert.equal(res.body.error, '');
    assert.equal(res.body.body.length, 2);
    const ids = res.body.body.map((player) => player._id).sort();
    assert.deepEqual(ids, [playerAId, playerBId].sort());
  });

  await t.test('POST /scores/getScoreOfPlayers returns each player\'s scores', async () => {
    const res = await request(app)
      .post('/scores/getScoreOfPlayers')
      .send({ playersIds: [playerAId, playerBId] });

    assert.equal(res.status, 200);
    assert.equal(res.body.error, '');
    assert.equal(res.body.body.length, 2);

    const forB = res.body.body.find((entry) => entry.playerId === playerBId);
    assert.equal(forB.rolesScore.length, 2);
    const carryScore = forB.rolesScore.find((score) => score.kills === 7);
    assert.ok(carryScore);
  });

  await t.test('GET /players/onePlayer/:id rewrites a null medail to "Sin Calibrar"', async () => {
    const res = await request(app).get(`/players/onePlayer/${playerAId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.error, '');
    assert.equal(res.body.body.medail, 'Sin Calibrar');
  });

  await t.test('GET /players/onePlayer/:id populates an existing medail', async () => {
    const res = await request(app).get(`/players/onePlayer/${playerBId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.body.medail.name, 'Bronze');
  });

  await t.test('PATCH /players/updateScore/:id recomputes the medail from mmr and updates scores', async () => {
    const res = await request(app)
      .patch(`/players/updateScore/${playerBId}`)
      .send({
        mmr: 2500,
        score: [
          { name: 'carry', score: roleScore({ kills: 1, victories: 0 }) },
          { name: 'support', score: roleScore({ kills: 1, victories: 0 }) },
        ],
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.error, '');

    const check = await request(app).get(`/players/onePlayer/${playerBId}`);
    assert.equal(check.body.body.mmr, 2500);
    assert.equal(check.body.body.medail.name, 'Silver');
  });

  await t.test('POST /players/updateImage/:id stores the uploaded image', async (t) => {
    const uploadedImagePath = path.join(__dirname, '..', 'uploads', `${playerBId}.png`);
    t.after(async () => {
      await fs.rm(uploadedImagePath).catch(() => {});
    });

    const res = await request(app)
      .post(`/players/updateImage/${playerBId}`)
      .attach('image', Buffer.from('fake-png-bytes'), {
        filename: 'avatar.png',
        contentType: 'image/png',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.error, '');
    assert.equal(res.body.body.imgURL.mimetype, 'image/png');
    assert.ok(res.body.body.imgURL.data);
  });

  await t.test('DELETE /players/deleteAllDataOfPlayers removes both players', async () => {
    const res = await request(app)
      .delete('/players/deleteAllDataOfPlayers')
      .send({ playersIds: [playerAId, playerBId] });

    assert.equal(res.status, 200);
    assert.equal(res.body.error, '');
    assert.equal(res.body.body.length, 2);
    assert.equal(res.body.body[0].deletedPlayer.playerId, playerAId);
    assert.equal(res.body.body[1].deletedPlayer.playerId, playerBId);

    const afterDelete = await request(app).get('/players/getAllPlayers');
    assert.equal(afterDelete.body.body.length, 0);
  });
});

after(disconnect);
