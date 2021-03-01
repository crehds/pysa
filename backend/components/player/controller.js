const store = require('./store');
const medailController = require('../medails/controller');
const rolesController = require('../roles/controller');
const scoreController = require('../score/controller');

async function getOnePlayer(playerId) {
  const result = await store.listOne(playerId);
  return result;
}

function addPlayer(player) {
  if (!player || Object.keys(player).length === 0) {
    return Promise.reject('Invalid data');
  }
  const { name, nickname, estado, mmr } = player;
  console.log(medails);
  const newPlayer = {
    name: {
      firstName: name.firstName,
      lastName: name.lastName,
    },
    nickname,
    mmr,
    estado,
  };
  return store.add(newPlayer);
}

function addPlayers(players) {
  if (!players || players.length === 0) {
    return Promise.reject('Invalid data');
  }

  const promises = players.map(async (player) => {
    let newPlayer = {
      name: {
        firstName: player.name.firstName,
        lastName: player.name.lastName,
      },
      medails: player.medails,
      nickname: player.nickname,
      mmr: player.mmr,
      estado: player.estado,
    };
    return store.add(newPlayer);
  });

  return Promise.all(promises);
}

// function updateMedail(medailId, playerId, player) {
//   console.log(player);
//   const newPlayer = {
//     name: {
//       firstName: player.name.firstName,
//       lastName: player.name.lastName,
//     },
//     nickname: player.nickname,
//     medails: medailId,
//     mmr: player.mmr,
//     estado: player.estado,
//   };
//   return store.update(newPlayer, playerId);
// }

async function addPlayersWithAllData(players) {
  let newPlayer = {};
  let resultPlayer = {};

  const promises = players.map(async (player) => {
    if (player.calibration.estado === 0) {
      const medailId = await medailController.getMedailByMMR(player.mmr);

      newPlayer = {
        name: {
          firstName: player.name.firstName,
          lastName: player.name.lastName,
        },
        medails: medailId,
        nickname: player.nickname,
        estado: player.estado,
        mmr: player.mmr,
      };
      resultPlayer = await store.add(newPlayer, false);
    } else {
      newPlayer = {
        name: {
          firstName: player.name.firstName,
          lastName: player.name.lastName,
        },
        medails: 'Sin Calibrar',
        nickname: player.nickname,
        estado: player.estado,
        mmr: player.mmr,
      };
      resultPlayer = await store.add(newPlayer, true);
    }

    const resultPlayerId = resultPlayer['_id'];

    const roles = await rolesController.getRoles();
    let results = await player.rolesScore.map(async (rolScore, i) => {
      let rolId = roles[i]['_id'];
      let result = await scoreController.addScore(
        resultPlayerId,
        rolId,
        rolScore.score
      );
      return result;
    });

    let resultsPromises = await Promise.all(results);

    return { ...resultPlayer, rolesScore: [...resultsPromises] };
  });

  return Promise.all(promises);
}

function patchPlayer(playerId, medailId) {
  const newPlayer = {
    medails: medailId,
  };

  return store.patch(playerId, newPlayer);
}
function deleteAll() {
  return store.deleteAll();
}

module.exports = {
  addPlayer,
  addPlayers,
  addPlayersWithAllData,
  getOnePlayer,
  patchPlayer,
  deleteAll,
};
