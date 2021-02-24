const store = require('./store');

async function addScore({
  player,
  rol,
  victories,
  victoriesDouble,
  defeats,
  defeatsDouble,
  kills,
  deaths,
  assists,
}) {
  const addScore = {
    player,
    rol,
    victories,
    victoriesDouble,
    defeats,
    defeatsDouble,
    kills,
    deaths,
    assists,
  };
  return await store.add(addScore);
}

async function getOneScore({ player, rol }) {
  const getScore = {
    player,
    rol,
  };
  return await store.listOne(getScore);
}

module.exports = { addScore, getOneScore };
