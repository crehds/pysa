const Model = require('./model');

function addScore(score) {
  const playerScore = new Model(score);
  return playerScore.save();
}

async function getOneScore({ player, rol }) {
  const result = await Model.find({ player,rol });
  return result;
}
module.exports = {
  add: addScore,
  listOne: getOneScore,
};
