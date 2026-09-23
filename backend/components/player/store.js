const mongoose = require('mongoose');
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
  let player;
  try {
    // .lean() returns a plain object instead of a Mongoose document, so the
    // medail field keeps what is stored (an uncalibrated player's 'Sin
    // Calibrar' string included) even though the schema types that path as
    // ObjectId (Mongoose would reject the cast on a live document).
    player = await Model2.findOne({ _id: playerId }).lean();
    // Only a medail id can be populated: casting 'Sin Calibrar' to one
    // throws a CastError.
    if (player && mongoose.isObjectIdOrHexString(player.medail)) {
      player = await Model2.populate(player, {
        path: 'medail',
        select: 'name',
        options: { lean: true },
      });
    }
  } catch (error) {
    console.log('Hubo un error');
    throw error;
  }

  if (player === null) {
    return 'No se encontró al jugador';
  }
  // The client always sends 'Sin Calibrar' for an uncalibrated player, but
  // POST /players/newPlayers and /addNewPlayers store whatever medail the
  // caller sends, including none, so check for "unset" rather than only the
  // explicit null a caller might send.
  if (!player.medail) {
    player.medail = 'Sin Calibrar';
  }
  return player;
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
