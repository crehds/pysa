const Model = require('./model');

function addScore(score) {
  const playerScore = new Model(score);
  return playerScore.save();
}

module.exports = {
  add: addScore,
};
