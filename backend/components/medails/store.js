const Model = require('./model');

function addMedail(medail) {
  const newMedail = new Model(medail);
  return newMedail.save();
}

module.exports = { add: addMedail };
