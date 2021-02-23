const Model = require('./model');

function addPlayer(user) {
  const myUser = new Model(user);
  return myUser.save();
}

module.exports = {
  addPlayer,
};
