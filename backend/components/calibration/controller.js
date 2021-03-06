const store = require('./store');

function addCalibration(playerId, calibration) {
  if (!calibration || Object.keys(calibration).length === 0) {
    return Promise.reject('Invalid data');
  }

  const { player, estado, remainingGames, initialMMR } = calibration;

  const newCalibration = {
    player: playerId,
    estado,
    remainingGames,
    initialMMR,
  };

  return store.add(newCalibration);
}

function getCalibration(playerId) {
  const player = {
    player: playerId,
  };
  return store.listOne(player);
}

function patchCalibration(playerId, calibration) {
  const newCalibration = {
    ...calibration,
  }
  return store.patch(playerId, newCalibration)
}
async function deleteAll() {
  const result = await store.deleteAll();
  return result;
}

module.exports = {
  addCalibration,
  getCalibration,
  patchCalibration,
  deleteAll,
};
