const Model = require('./model');

async function getMedails() {
  const getMedails = await Model.find();
  return getMedails;
}

function addMedail(medail) {
  const newMedail = new Model(medail);
  return newMedail.save();
}

module.exports = { add: addMedail, list: getMedails };
