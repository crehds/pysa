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

//Se reescribió el update para testear  desde el cliente
async function updateOneScore2(playerId, rolId, score) {
  // const result = await Model.findOneAndUpdate(
  //   { player: playerId, rol: rolId },
  //   {},
  //   { new: true },
  //   function (err, doc) {
  //     if (err) return `[Error] Details:${err}`;
  //     doc.victories += score.victories;
  //     doc.victoriesDouble += score.victoriesDouble;
  //     doc.defeats += score.defeats;
  //     doc.defeatsDouble += score.defeatsDouble;
  //     doc.kills += score.kills;
  //     doc.deaths += score.deaths;
  //     doc.assists += score.assists;
  //     doc.save();
  //   }
  // );
  const doc = await Model.findOne({ player: playerId, rol: rolId });
  doc.victories += score.victories;
  doc.victoriesDouble += score.victoriesDouble;
  doc.defeats += score.defeats;
  doc.defeatsDouble += score.defeatsDouble;
  doc.kills += score.kills;
  doc.deaths += score.deaths;
  doc.assists += score.assists;
  const result = await doc.save();

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
  updateOne2: updateOneScore2,
  deleteAll,
  deleteOne,
};
