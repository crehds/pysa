const Model = require('./model');

function addCalibration(data) {
  const newCalibration = new Model(data);
  return newCalibration.save();
}

module.exports = {
  add: addCalibration,
};
