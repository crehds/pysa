const { model: Model, model2: Model2 } = require('./model');

function addPlayer(user, calibration) {
  if (calibration) {
    const addPlayer = new Model(user);
    return addPlayer.save();
  } else {
    const addPlayer = new Model2(user);
    return addPlayer.save();
  }
}

async function getPlayer(playerId) {
  return new Promise((resolve, reject) => {
    Model.find({ _id: playerId })
      .populate('medails', 'name')
      .exec((error, populated) => {
        if (error) {
          reject(error);
          return false;
        }
        resolve(populated);
      });
  });
}

//only if the structure of model, change
// async function updateMedail(newPlayer, playerId) {
//   return await Model.findByIdAndUpdate(playerId, newPlayer, {
//     overwrite: true,
//   });
// }

async function deletePlayers() {
  return await Model.deleteMany();
}

async function patchPlayer(playerId, newPlayer) {
  return await Model.findByIdAndUpdate(playerId, newPlayer, { new: true });
}

module.exports = {
  add: addPlayer,
  listOne: getPlayer,
  patch: patchPlayer,
  deleteAll: deletePlayers,
};
