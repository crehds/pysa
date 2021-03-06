const store = require('./store');

function addCalibration(calibration) {
  if (!calibration || Object.keys(calibration).length === 0) {
    return Promise.reject('Invalid data');
  }

  const { player, estado, remainingGames, initialMMR } = calibration;

  const newCalibration = {
    player,
    estado,
    remainingGames,
    initialMMR,
  };

  return store.add(newCalibration);
}

async function deleteAll() {
  const result = await store.deleteAll();
  return result;
}

module.exports = {
  addCalibration,
  deleteAll,
};