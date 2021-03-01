const store = require('./store');
const rolesController = require('../roles/controller');

async function addScore(playerId, rolId, score) {
  const {
    victories,
    victoriesDouble,
    defeats,
    defeatsDouble,
    kills,
    deaths,
    assists,
  } = score;
  const addScore = {
    player: playerId,
    rol: rolId,
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

async function addOrUpdateScores(playerId, rolesScore, action) {
  const roles = await rolesController.getRoles();
  const results = await rolesScore.map(async (rolScore) => {
    let rolId = roles.find((rol) => rolScore.name === rol.name)['_id'];
    const result =
      action === 'add'
        ? await addScore(playerId, rolId, rolScore.score)
        : await store.updateOne(playerId, rolId, rolScore.score);

    return result;
  });

  return Promise.all(results);
}

async function getOneScore(playerId) {
  let player = {
    player: playerId,
  };
  return await store.listOne(player);
}

function deleteOne(playerId) {
  return store.deleteOne(playerId);
}

function deleteAllScore() {
  return store.deleteAll();
}

module.exports = {
  addScore,
  addOrUpdateScores,
  getOneScore,
  deleteOne,
  deleteAllScore,
};
