const store = require('./store');

function addPlayer(player) {
  if (!player) {
    return Promise.reject('Invalid data');
  }
  const { name, nickname, estado, mmr } = player;
  const newPlayer = {
    name: {
      firstName: name.firstName,
      lastName: name.lastName,
    },
    nickname,
    estado,
    mmr,
  };
  return store.addPlayer(newPlayer);
}

module.exports = {
  addPlayer,
};
