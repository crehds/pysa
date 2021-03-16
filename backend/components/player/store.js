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
    Model.findOne({ _id: playerId })
      .populate('medail', 'name')
      .exec((error, populated) => {
        if (error) {
          console.log('Hubo un error');
          reject(error);
          return false;
        }
        if (populated.medail === null) {
          populated.medail = 'Sin Calibrar';
        }
        resolve(populated);
      });
  });
}

async function getAllPlayers() {
  const players = await Model.find();
  return players;
}

//only if the structure of model, change
// async function updateMedail(newPlayer, playerId) {
//   return await Model.findByIdAndUpdate(playerId, newPlayer, {
//     overwrite: true,
//   });
// }

async function updateImage(playerId, playerWithPath) {
  const doc = await Model2.findOneAndUpdate(
    { _id: playerId },
    { ...playerWithPath },
    { new: true, strict: false }
  );
  console.log(doc);
  return doc;
}

async function deletePlayers() {
  return await Model.deleteMany();
}

async function patchPlayer(playerId, newPlayer) {
  return await Model2.findByIdAndUpdate(playerId, newPlayer, { new: true });
}

async function patchPlayer2(playerId, notCalibrated) {
  return await Model.findByIdAndUpdate(playerId, notCalibrated, { new: true });
}

module.exports = {
  add: addPlayer,
  listOne: getPlayer,
  list: getAllPlayers,
  patch: patchPlayer,
  setImage: updateImage,
  notCalibrated: patchPlayer2,
  deleteAll: deletePlayers,
};
