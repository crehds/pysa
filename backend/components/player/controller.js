const store = require('./store');
const medailController = require('../medails/controller');
const rolesController = require('../roles/controller');
const scoreController = require('../score/controller');
const calibrationController = require('../calibration/controller');
const { fileToBuffer } = require('../../utils');

async function getOnePlayer(playerId) {
  const result = await store.listOne(playerId);
  return result;
}

async function getAllPlayers() {
  const results = await store.list();
  return results;
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

async function addNewPlayers(newPlayers) {
  const arrPlayers = JSON.parse(JSON.stringify(newPlayers));
  const savedNewPlayers = await store.addNews(arrPlayers);

  const result = savedNewPlayers.map(async (savedNewPlayer, index) => {
    const savedPlayerId = savedNewPlayer['_id'];
    const calibration = await calibrationController.addCalibration(
      savedPlayerId,
      newPlayers[index].calibration
    );

    const score = await scoreController.addOrUpdateScores(
      savedPlayerId,
      newPlayers[index].rolesScore,
      'add'
    );

    return { ...savedNewPlayer, rolesScore: [...score], calibration };
  });

  return Promise.all(result);
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
      medail: player.medail,
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
        medail: medailId,
        nickname: player.nickname,
        estado: player.estado,
        mmr: player.mmr,
        imgURL: player.imgURL,
      };
      resultPlayer = await store.add(newPlayer, false);
    } else {
      newPlayer = {
        name: {
          firstName: player.name.firstName,
          lastName: player.name.lastName,
        },
        medail: 'Sin Calibrar',
        nickname: player.nickname,
        estado: player.estado,
        mmr: player.mmr,
        imgURL: player.imgURL,
      };
      resultPlayer = await store.add(newPlayer, true);
    }
    const resultPlayerId = resultPlayer['_id'];
    const calibration = await calibrationController.addCalibration(
      resultPlayerId,
      player.calibration
    );

    const results = await scoreController.addOrUpdateScores(
      resultPlayerId,
      player.rolesScore,
      'add'
    );
    // const roles = await rolesController.getRoles();
    // let results = await player.rolesScore.map(async (rolScore, i) => {
    //   let rolId = roles[i]['_id'];
    //   let result = await scoreController.addScore(
    //     resultPlayerId,
    //     rolId,
    //     rolScore.score
    //   );
    //   return result;
    // });

    // let resultsPromises = await Promise.all(results);

    return { ...resultPlayer, rolesScore: [...results], calibration };
  });

  return Promise.all(promises);
}

function patchPlayer(playerId, medailId, mmr) {
  const newPlayer = {
    medail: medailId,
    mmr,
  };

  return store.patch(playerId, newPlayer);
}

async function updatePlayer(playerId, player) {
  if (player.medail === 'Sin Calibrar') {
    let result = await calibrationController.getCalibration(playerId);

    if (result.remainingGames < player.partidas) {
      return Promise.reject('Invalid number of remaining games');
    }
    if (result.remainingGames > player.partidas) {
      const calibration = await calibrationController.patchCalibration(
        playerId,
        { remainingGames: result.remainingGames - player.partidas }
      );

      const currentPlayer = await getOnePlayer(playerId);
      const updateScore = await scoreController.addOrUpdateScores(
        playerId,
        player.score,
        'update'
      );

      return Promise.resolve({ updatePlayer: currentPlayer, updateScore });
    }
    if (result.remainingGames === player.partidas) {
      const medail = await medailController.getMedailByMMR(player.mmr);
      const setMedail = await patchPlayer(playerId, medail, player.mmr);
      const calibration = await calibrationController.patchCalibration(
        playerId,
        { remainingGames: 0, estado: 0 }
      );
      const updateScore = await scoreController.addOrUpdateScores(
        playerId,
        player.score,
        'update'
      );
      return Promise.resolve({ updatePlayer: setMedail, updateScore });
    }
  }

  const medail = await medailController.getMedailByMMR(player.mmr);
  const setMedail = await patchPlayer(playerId, medail, player.mmr);

  const updateScore = await scoreController.addOrUpdateScores(
    playerId,
    player.score,
    'update'
  );

  return Promise.resolve({ updatePlayer: setMedail, updateScore });
}

async function updateImagePlayer(playerId, image) {
  const buffer = await fileToBuffer(image);
  const player = {
    imgURL: {
      data: buffer,
      mimetype: image.mimetype,
    },
  };

  return store.setImage(playerId, player);
}

//método implementado antes de enterarme que heroku borraba las imágenes en al versión gratuita
// function updateImagePlayer(playerId, pathImageURL) {
//   const player = {
//     imgURL: pathImageURL,
//   };
//   return store.setImage(playerId, player);
// }

function setNotCalibrated(playerId) {
  const newPlayer = {
    medail: 'Sin Calibrar',
  };
  return store.notCalibrated(playerId, newPlayer);
}

async function deleteAllDataOfPlayers(playersIds) {
  let result = playersIds.map(async (playerId) => {
    let deletedPlayer = await deleteAllDataOfPlayer(playerId);
    return deletedPlayer;
  });

  return Promise.all(result);
}

async function deleteAllDataOfPlayer(playerId) {
  const deletedScore = await scoreController.deleteOne(playerId);
  const deletedCalibration = await calibrationController.deleteOne(playerId);
  const deletedPlayer = await store.deleteOne(playerId);

  return { deletedScore, deletedCalibration, deletedPlayer };
}

function deleteAll() {
  return store.deleteAll();
}

module.exports = {
  addPlayer,
  addPlayers,
  addPlayersWithAllData,
  getOnePlayer,
  getAllPlayers,
  setNotCalibrated,
  updatePlayer,
  patchPlayer,
  deleteAll,
  updateImagePlayer,
  addNewPlayers,
  deleteAllDataOfPlayers,
};
