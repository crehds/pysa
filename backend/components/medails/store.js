const Model = require('./model');

async function getMedail(medailId) {
  const medail = await Model.findById(medailId);
  return medail;
}

async function getMedails() {
  const getMedails = await Model.find();
  return getMedails;
}

function addMedail(medail) {
  const newMedail = new Model(medail);
  return newMedail.save();
}

//la version gratuita no admite JS por lo tanto
// no puedo usar $where
// async function getMedailByMMR(mmr) {
//   let
//   const medailByMMR = await Model.find({$where: function() {
//     return this.minimo <= mmr && this.maximo >= mmr
//   }})
//   return medailByMMR;
// }

async function patchMedail(medailId, medail) {
  const updatedMedail = await Model.updateOne(
    {
      _id: medailId,
    },
    {
      $set: {
        ...medail,
      },
    }
  );
  return updatedMedail;
}

module.exports = {
  add: addMedail,
  list: getMedails,
  listOne: getMedail,
  patch: patchMedail,
};
