'use strict';

const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { resetDatabase, disconnect, mongoose, TEST_MONGODB_URI } = require('../support/testEnv');
const { seed, assertLocalHost, hostnameFromUri } = require('../seed');
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

  await t.test('hostnameFromUri normalizes an IPv6 loopback literal', () => {
    // WHATWG URL wraps IPv6 literals in brackets ("[::1]"); the bracket-less
    // form is what LOCAL_HOSTNAMES stores and what mongoose.connection.host
    // reports.
    assert.equal(hostnameFromUri('mongodb://[::1]:27017/pysa_test'), '::1');
  });

  await t.test('hostnameFromUri throws a clear error on an unparseable uri', () => {
    assert.throws(() => hostnameFromUri('not a uri'), /Could not parse a host/);
  });

  await t.test('assertLocalHost accepts loopback hostnames, including IPv6', () => {
    assert.doesNotThrow(() => assertLocalHost('127.0.0.1', false));
    assert.doesNotThrow(() => assertLocalHost('localhost', false));
    assert.doesNotThrow(() => assertLocalHost('::1', false));
  });

  await t.test('assertLocalHost refuses a non-local hostname without force', () => {
    assert.throws(() => assertLocalHost('example.com', false), /local/i);
  });

  await t.test('assertLocalHost allows a non-local hostname when forced', () => {
    assert.doesNotThrow(() => assertLocalHost('example.com', true));
  });

  await t.test('refuses a non-local uri without --force when not already connected', async () => {
    await mongoose.disconnect();
    try {
      await assert.rejects(
        () => seed('mongodb://example.com:27017/pysa_test'),
        /local/i
      );
    } finally {
      await mongoose.connect(TEST_MONGODB_URI);
    }
  });

  await t.test('seeds through an already-open connection and ignores a mismatched uri', async () => {
    // The suite is already connected to the local test database at this
    // point, so the guard must check that live connection's real host, not
    // this deliberately wrong uri argument, which seed() never connects to.
    const counts = await seed('mongodb://example.com:27017/ignored');
    assert.equal(counts.medails, expectedMedails);
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

  await t.test('does not touch a collection it does not own', async () => {
    const untouched = mongoose.connection.db.collection('untouched');
    await untouched.insertOne({ marker: 'keep-me' });

    await seed(TEST_MONGODB_URI);

    assert.equal(await untouched.countDocuments(), 1);
  });
});

after(disconnect);
