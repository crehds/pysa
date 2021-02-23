const Model = require('./model');

function addPlayer(user) {
  const addPlayer = new Model(user);
  return addPlayer.save();
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

module.exports = {
  add: addPlayer,
  listOne: getPlayer,
};
