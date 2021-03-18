const Model = require('./model');

function addCalibration(data) {
  const newCalibration = new Model(data);
  return newCalibration.save();
}

async function getCalibration(playerId) {
  const result = await Model.findOne(playerId);
  return result;
}

async function patchCalibration(player, calibration) {
  const result = await Model.findOneAndUpdate({ player }, calibration, {
    new: true,
  });
  return result;
}

async function deleteOne(playerId) {
  const result = await Model.deleteOne({ player: playerId });
  return result;
}

async function deleteAll() {
  const result = await Model.deleteMany();
  return result;
}

module.exports = {
  add: addCalibration,
  listOne: getCalibration,
  patch: patchCalibration,
  deleteOne,
  deleteAll,
};
