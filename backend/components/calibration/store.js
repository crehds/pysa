const Model = require('./model');

function addCalibration(data) {
  const newCalibration = new Model(data);
  return newCalibration.save();
}

async function deleteAll() {
  const result = await Model.deleteMany();
  return result;
}
module.exports = {
  add: addCalibration,
  deleteAll,
};
