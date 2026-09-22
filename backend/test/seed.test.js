'use strict';

const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { resetDatabase, disconnect, TEST_MONGODB_URI } = require('../support/testEnv');
const { seed } = require('../seed');
const medallasData = require('../seed/data/medallas.json');
const playersData = require('../seed/data/players.json');
const { model: PlayerModel } = require('../components/player/model');
const RoleModel = require('../components/roles/model');
const MedailModel = require('../components/medails/model');
const ScoreModel = require('../components/score/model');
const CalibrationModel = require('../components/calibration/model');

const expectedMedails = medallasData.medallas.length;
const expectedRoles = new Set(
  playersData.players.flatMap((player) =>
    player.rolesScore.map((roleScore) => roleScore.name)
  )
).size;
const expectedPlayers = playersData.players.length;

async function collectionCounts() {
  const [medails, roles, players, scores, calibrations] = await Promise.all([
    MedailModel.countDocuments(),
    RoleModel.countDocuments(),
    PlayerModel.countDocuments(),
    ScoreModel.countDocuments(),
    CalibrationModel.countDocuments(),
  ]);
  return { medails, roles, players, scores, calibrations };
}

test('seed: populates medails, roles, players, scores and calibrations consistently', async (t) => {
  await resetDatabase();

  await t.test('refuses a non-local host without --force', async () => {
    await assert.rejects(
      () => seed('mongodb://example.com:27017/pysa_test'),
      /local/i
    );
  });

  await t.test('inserts the expected counts', async () => {
    const counts = await seed(TEST_MONGODB_URI);
    assert.equal(counts.medails, expectedMedails);
    assert.equal(counts.roles, expectedRoles);
    assert.equal(counts.players, expectedPlayers);

    const inDb = await collectionCounts();
    assert.equal(inDb.medails, expectedMedails);
    assert.equal(inDb.roles, expectedRoles);
    assert.equal(inDb.players, expectedPlayers);
    // One score document per player per role, one calibration per player.
    assert.equal(inDb.scores, expectedPlayers * expectedRoles);
    assert.equal(inDb.calibrations, expectedPlayers);
  });

  await t.test('running it twice yields the same state, not duplicates', async () => {
    const counts = await seed(TEST_MONGODB_URI);
    assert.equal(counts.medails, expectedMedails);
    assert.equal(counts.roles, expectedRoles);
    assert.equal(counts.players, expectedPlayers);

    const inDb = await collectionCounts();
    assert.equal(inDb.medails, expectedMedails);
    assert.equal(inDb.roles, expectedRoles);
    assert.equal(inDb.players, expectedPlayers);
    assert.equal(inDb.scores, expectedPlayers * expectedRoles);
    assert.equal(inDb.calibrations, expectedPlayers);
  });
});

after(disconnect);
