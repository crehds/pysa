const store = require('./store');

async function getOnePlayer(playerId) {
  const result = await store.listOne(playerId);
  return result;
}

function addPlayer(player) {
  if (!player) {
    return Promise.reject('Invalid data');
  }
  const { name, nickname, medails, estado, mmr } = player;
  console.log(medails);
  const newPlayer = {
    name: {
      firstName: name.firstName,
      lastName: name.lastName,
    },
    medails,
    nickname,
    mmr,
    estado,
  };
  return store.add(newPlayer);
}

module.exports = {
  addPlayer,
  getOnePlayer,
};
