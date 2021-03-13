export function sortPlayers(players) {
  return players.sort((a, b) => {
    if (b.mmr === a.mmr) {
      return b.kda - a.kda;
    }
    return b.mmr - a.mmr;
  });
}

function setScoreOfPlayers(players, score) {
  const playersWithScore = players.map((player) => {
    return scoreOnePlayer(player, score);
  });

  return playersWithScore;
}

function scoreOnePlayer(player, score) {
  let rolesScore = score.find((score) => player['_id'] === score.playerId)
    .rolesScore;
  return { ...player, rolesScore };
}

function orderedRoles(player, roles) {
  let playerWithOrderedRoles = JSON.parse(JSON.stringify(player));
  let orderedRoles = roles.map((rol) => {
    let sortRol = playerWithOrderedRoles.rolesScore.find(
      (rolScore) => rolScore.rol === rol['_id']
    );
    return { ...sortRol, rol: rol.name };
  });
  playerWithOrderedRoles.rolesScore = orderedRoles;
  return playerWithOrderedRoles;
}

function calcKdaAndGames(rolesScore) {
  let partidas = 0;
  let obj = rolesScore.reduce(
    (acc, cv) => {
      partidas +=
        cv.victories + cv.victoriesDouble + cv.defeats + cv.defeatsDouble;
      return (acc = {
        ...acc,
        kills: acc.kills + cv.kills,
        deaths: acc.deaths + cv.deaths,
        assists: acc.assists + cv.assists,
      });
    },
    { kills: 0, deaths: 0, assists: 0 }
  );

  let kda = ((obj.kills + obj.assists) / obj.deaths).toFixed(2);
  kda = kda.length === 4 ? kda : kda.length === 1 ? `${kda}.00` : `${kda}0`;
  return { partidas, kda };
}

function isCalibrated(player) {
  if (player.medail !== 'Sin Calibrar') {
    return true;
  } else {
    return false;
  }
}

function setMedail(player, medails) {
  let newPlayer = Object.assign({}, player);
  let calibrated = isCalibrated(player);
  if (calibrated) {
    newPlayer.medail = medails.find(
      (medail) => newPlayer.medail === medail['_id']
    ).name;
  }
  return newPlayer;
}

function setKDAAndMedail(players, medails, roles) {
  const results = players.map((player) => {
    let playerWithOrderedRoles = orderedRoles(player, roles);
    let { partidas, kda } = calcKdaAndGames(playerWithOrderedRoles.rolesScore);

    let playerWithMedail = setMedail(playerWithOrderedRoles, medails);

    return {
      ...playerWithMedail,
      kda,
      partidas,
    };
  });
  return results;
}

function filteringPlayers(players) {
  const filteredPlayers = players.filter(
    (player) => player.estado === true && player.medail !== 'Sin Calibrar'
  );

  return filteredPlayers;
}

export function dataForApp({ players, scorePlayers, medails, roles }) {
  const playersWithScore = setScoreOfPlayers(players, scorePlayers);
  const playersWithAllData = setKDAAndMedail(playersWithScore, medails, roles);
  const filteredPlayers = filteringPlayers(playersWithAllData);
  const orderedPlayers = sortPlayers(filteredPlayers);

  return { orderedPlayers, playersWithAllData };
}

function updatingPlayerCalibrated(state, playerforUpdate) {
  let newState = JSON.parse(JSON.stringify(state));
  const dataForUpdate = processingPlayer(newState, playerforUpdate);
  let indexInRanking = findPlayer(newState.ranking, dataForUpdate['_id']);
  if (indexInRanking === -1) {
    newState.ranking.push(dataForUpdate);
    sortPlayers(newState.ranking);
  } else {
    newState.ranking[indexInRanking] = dataForUpdate;
  }
  let indexInAllPlayers = findPlayer(newState.allPlayers, dataForUpdate['_id']);

  newState.allPlayers[indexInAllPlayers] = dataForUpdate;

  return newState;
}

export function updatingPlayer(state, playerforUpdate, calibration) {
  let newState = JSON.parse(JSON.stringify(state));
  let player = JSON.parse(JSON.stringify(playerforUpdate.updatePlayer));
  let rolesScore = JSON.parse(JSON.stringify(playerforUpdate.updateScore));

  player.rolesScore = rolesScore;

  let playerWithOrderedRoles = orderedRoles(player, newState.roles);

  switch (calibration) {
    case 'Calibrado':
      newState = updatingPlayerCalibrated(newState, playerWithOrderedRoles);
      return newState;
    case 'Sin Calibrar':
      let indexInAllPlayers = findPlayer(newState.allPlayers, player['_id']);
      newState.allPlayers[indexInAllPlayers] = playerWithOrderedRoles;
      return newState;
    default:
      break;
  }
}

function processingPlayer(state, playerWithOrderedRoles) {
  let { partidas, kda } = calcKdaAndGames(playerWithOrderedRoles.rolesScore);
  let playerWithMedail = setMedail(playerWithOrderedRoles, state.medails);

  return { ...playerWithMedail, kda, partidas };
}

function findPlayer(arrayToSearch = [], playerId) {
  return arrayToSearch.findIndex((player) => player['_id'] === playerId);
}
