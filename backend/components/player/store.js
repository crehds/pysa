const { model: Model, model2: Model2, model3: Model3 } = require('./model');

function addPlayer(user, calibration) {
  if (calibration) {
    const addPlayer = new Model(user);
    return addPlayer.save();
  } else {
    const addPlayer = new Model2(user);
    return addPlayer.save();
  }
}

async function addNewPlayers(newPlayers) {
  return Model.insertMany(newPlayers);
}

async function getPlayer(playerId) {
  let populated;
  try {
    populated = await Model2.findOne({ _id: playerId }).populate(
      'medail',
      'name'
    );
  } catch (error) {
    console.log('Hubo un error');
    throw error;
  }

  if (populated === null) {
    return 'No se encontró al jugador';
  }
  if (populated.medail === null) {
    populated.medail = 'Sin Calibrar';
  }
  return populated;
}

async function getAllPlayers() {
  const players = await Model3.find();
  return players;
}

//only if the structure of model, change
// async function updateMedail(newPlayer, playerId) {
//   return await Model.findByIdAndUpdate(playerId, newPlayer, {
//     overwrite: true,
//   });
// }

async function updateImage(playerId, playerWithImg) {
  const doc = await Model3.findByIdAndUpdate(playerId, playerWithImg, {
    returnDocument: 'after',
    strict: false,
    upsert: true,
  });

  return doc;
}

//método implementado antes de enterarme que heroku borraba las imágenes en al versión gratuita
// async function updateImage(playerId, playerWithPath) {
//   const doc = await Model2.findOneAndUpdate(
//     { _id: playerId },
//     { ...playerWithPath },
//     { new: true, strict: false }
//   );
//   return doc;
// }

async function deletePlayer(playerId) {
  const result = await Model.deleteOne({ _id: playerId });
  return { result, playerId };
}
async function deletePlayers() {
  return await Model.deleteMany();
}

async function patchPlayer(playerId, newPlayer) {
  return await Model2.findByIdAndUpdate(playerId, newPlayer, {
    returnDocument: 'after',
  });
}

async function patchPlayer2(playerId, notCalibrated) {
  return await Model.findByIdAndUpdate(playerId, notCalibrated, {
    returnDocument: 'after',
  });
}

module.exports = {
  add: addPlayer,
  listOne: getPlayer,
  list: getAllPlayers,
  patch: patchPlayer,
  setImage: updateImage,
  notCalibrated: patchPlayer2,
  deleteOne: deletePlayer,
  deleteAll: deletePlayers,
  addNews: addNewPlayers,
};
