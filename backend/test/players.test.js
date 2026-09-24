'use strict';

const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const request = require('supertest');
const { app, resetDatabase, disconnect, loginAsAdmin } = require('../support/testEnv');

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
  const agent = await loginAsAdmin();

  await agent
    .post('/roles/setRoles')
    .send({ roles: [{ name: 'carry' }, { name: 'support' }] });

  const setMedails = await agent
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
    const res = await agent
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
    // Deliberately the bare (unauthenticated) client: this route is public
    // (see backend/components/score/network.js), and the public pages call
    // it exactly like this (client/src/hooks/useGetData.js).
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
    const res = await agent
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

    const res = await agent
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

  await t.test('POST /players/updateImage/:id and GET /players/getAllPlayers agree on the imgURL shape', async (t) => {
    const uploadedImagePath = path.join(__dirname, '..', 'uploads', `${playerBId}.png`);
    t.after(async () => {
      await fs.rm(uploadedImagePath).catch(() => {});
    });

    // Both routes read the same Model3 (strict: false, no schema for
    // imgURL) document, but through different query shapes
    // (findByIdAndUpdate's returned doc vs find()'s array), so the client
    // (client/src/utils/playerImage.js) must not have to guess between two
    // different wire shapes for the same field.
    const uploadRes = await agent
      .post(`/players/updateImage/${playerBId}`)
      .attach('image', Buffer.from('fake-png-bytes'), {
        filename: 'avatar.png',
        contentType: 'image/png',
      });
    assert.equal(uploadRes.status, 200);
    const uploadedImgURL = uploadRes.body.body.imgURL;

    const listRes = await request(app).get('/players/getAllPlayers');
    assert.equal(listRes.status, 200);
    const listedPlayer = listRes.body.body.find(
      (player) => player._id === playerBId
    );
    assert.ok(listedPlayer, 'the uploaded-to player must still be listed');
    const listedImgURL = listedPlayer.imgURL;

    assert.equal(listedImgURL.mimetype, uploadedImgURL.mimetype);
    assert.deepEqual(
      listedImgURL.data,
      uploadedImgURL.data,
      `imgURL.data shape differs between the upload response (${JSON.stringify(uploadedImgURL.data)}) ` +
        `and getAllPlayers (${JSON.stringify(listedImgURL.data)})`
    );
  });

  await t.test('DELETE /players/deleteAllDataOfPlayers removes both players', async () => {
    const res = await agent
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

test('players: a player created without a medail field defaults to "Sin Calibrar"', async () => {
  await resetDatabase();
  const agent = await loginAsAdmin();

  // Unlike playerNoMedail above (medail: null), this omits the key
  // entirely, which /newPlayers stores as-is when a caller sends no medail.
  const created = await agent
    .post('/players/newPlayers')
    .send({
      players: [
        { name: { firstName: 'Kai', lastName: 'Lu' }, nickname: 'kai', mmr: 700, estado: true },
      ],
    });
  const playerId = created.body.body[0]._id;

  const res = await request(app).get(`/players/onePlayer/${playerId}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.body.medail, 'Sin Calibrar');
});

test('players: setNotCalibrated, deleteAll, and an invalid id', async (t) => {
  await resetDatabase();
  const agent = await loginAsAdmin();

  const created = await agent
    .post('/players/newPlayers')
    .send({
      players: [
        {
          name: { firstName: 'Cid', lastName: 'Ray' },
          nickname: 'cid',
          mmr: 800,
          estado: true,
          medail: null,
        },
      ],
    });
  const playerId = created.body.body[0]._id;

  await t.test('PATCH /players/setNotCalibrated/:playerId resets the medail', async () => {
    const res = await agent.patch(`/players/setNotCalibrated/${playerId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.error, '');
    assert.equal(res.body.body.medail, 'Sin Calibrar');
  });

  await t.test('GET /players/onePlayer/:id answers a stored "Sin Calibrar" medail as-is', async () => {
    // setNotCalibrated above stored the 'Sin Calibrar' string, which is how
    // the app marks every uncalibrated player, so it is not a medail id.
    const res = await request(app).get(`/players/onePlayer/${playerId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.body.medail, 'Sin Calibrar');
  });

  await t.test('GET /players/onePlayer/:id with an invalid id characterizes current error handling', async () => {
    const res = await request(app).get('/players/onePlayer/not-an-object-id');
    assert.equal(res.status, 500);
    assert.equal(res.body.error, 'Unexpected error');
  });

  await t.test('DELETE /players/deleteAll removes every player', async () => {
    const res = await agent.delete('/players/deleteAll');
    assert.equal(res.status, 200);
    assert.equal(res.body.error, '');

    const check = await request(app).get('/players/getAllPlayers');
    assert.equal(check.body.body.length, 0);
  });
});

after(disconnect);
