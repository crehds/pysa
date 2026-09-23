'use strict';

const mongoose = require('mongoose');

const MedailModel = require('../components/medails/model');
const RoleModel = require('../components/roles/model');
const ScoreModel = require('../components/score/model');
const CalibrationModel = require('../components/calibration/model');
const { model: PlayerModel } = require('../components/player/model');
const playerController = require('../components/player/controller');

const medallasData = require('./data/medallas.json');
const playersData = require('./data/players.json');

const LOCAL_HOSTNAMES = new Set(['127.0.0.1', 'localhost', '::1']);

// WHATWG URL wraps an IPv6 literal in brackets (e.g. "[::1]"), but
// LOCAL_HOSTNAMES and mongoose.connection.host both use the bracket-less
// form, so strip them here to keep the two comparable.
function hostnameFromUri(uri) {
  let hostname;
  try {
    hostname = new URL(uri).hostname;
  } catch {
    throw new Error(`Could not parse a host from MONGODB_URI "${uri}".`);
  }
  return hostname.replace(/^\[|\]$/g, '');
}

function assertLocalHost(hostname, force) {
  if (force) {
    return;
  }

  if (!LOCAL_HOSTNAMES.has(hostname)) {
    throw new Error(
      `Refusing to seed non-local host "${hostname}". Pass --force to override.`
    );
  }
}

// Resets the collections this script owns and inserts fresh data, so running
// it twice leaves the database in the same state instead of duplicating it.
async function seed(uri, { force = false } = {}) {
  const wasConnected = mongoose.connection.readyState === 1;

  // When a connection is already open, every write below goes through it and
  // `uri` is never used to connect, so the connection's real host is what
  // must be checked; otherwise `uri` is exactly what mongoose.connect()
  // below will use.
  const hostname = wasConnected
    ? mongoose.connection.host
    : hostnameFromUri(uri);
  assertLocalHost(hostname, force);

  try {
    if (!wasConnected) {
      await mongoose.connect(uri);
    }

    await Promise.all([
      MedailModel.deleteMany({}),
      RoleModel.deleteMany({}),
      PlayerModel.deleteMany({}),
      ScoreModel.deleteMany({}),
      CalibrationModel.deleteMany({}),
    ]);

    const medails = await MedailModel.insertMany(
      medallasData.medallas.map((medail) => ({
        name: medail.nombre,
        minimo: medail.minimo,
        maximo: medail.maximo,
      }))
    );

    const roleNames = [
      ...new Set(
        playersData.players.flatMap((player) =>
          player.rolesScore.map((roleScore) => roleScore.name)
        )
      ),
    ];
    const roles = await RoleModel.insertMany(
      roleNames.map((name) => ({ name }))
    );

    // Goes through the same controller addNewPlayers() uses, so the created
    // players, their scores and their calibrations stay consistent with each
    // other exactly like a real POST /players/addNewPlayers call would.
    const players = await playerController.addNewPlayers(playersData.players);

    return { medails: medails.length, roles: roles.length, players: players.length };
  } finally {
    if (!wasConnected) {
      await mongoose.disconnect();
    }
  }
}

module.exports = { seed, assertLocalHost, hostnameFromUri };

if (require.main === module) {
  (async () => {
    const uri = process.env.MONGODB_URI;
    const force = process.argv.includes('--force');

    if (!uri) {
      console.error('MONGODB_URI is not set (e.g. mongodb://127.0.0.1:27017/pysa)');
      process.exit(1);
    }

    try {
      const counts = await seed(uri, { force });
      console.log(
        `[seed] medails=${counts.medails} roles=${counts.roles} players=${counts.players}`
      );
      process.exit(0);
    } catch (error) {
      console.error('[seed] failed:', error.message);
      process.exit(1);
    }
  })();
}
