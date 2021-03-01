const Model = require('./model');

async function addScore(score) {
  const playerScore = new Model(score);
  const result = await playerScore.save();
  return result;
}

async function getOneScore(player) {
  const result = await Model.find(player);
  return result;
}

async function updateOneScore(playerId, rolId, score) {
  const result = await Model.findOneAndUpdate(
    { player: playerId, rol: rolId },
    { ...score },
    { new: true }
  );

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
  add: addScore,
  listOne: getOneScore,
  updateOne: updateOneScore,
  deleteAll,
  deleteOne,
};
