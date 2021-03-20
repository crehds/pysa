import {
  filteringPlayers,
  findPlayer,
  orderedRoles,
  setKDAAndMedail,
  setScoreOfPlayers,
  sortPlayers,
  updatingPlayerCalibrated,
} from './functions';

export function dataForApp({ players, scorePlayers, medails, roles }) {
  const playersWithScore = setScoreOfPlayers(players, scorePlayers);
  const playersWithAllData = setKDAAndMedail(playersWithScore, medails, roles);
  const filteredPlayers = filteringPlayers(playersWithAllData);
  const orderedPlayers = sortPlayers(filteredPlayers);

  return { orderedPlayers, playersWithAllData };
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

export function updateImagePlayer(state, player) {
  let newState = JSON.parse(JSON.stringify(state));

  let indexInRanking = findPlayer(newState.ranking, player.id);

  if (indexInRanking !== -1) {
    newState.ranking[indexInRanking].imgURL = player.newImgURL;
  }
  let indexInAllPlayers = findPlayer(newState.allPlayers, player.id);
  newState.allPlayers[indexInAllPlayers].imgURL = player.newImgURL;

  return newState;
}

export function addPlayers(state, playersForAdd) {
  let newState = JSON.parse(JSON.stringify(state));
  let newPlayers = JSON.parse(JSON.stringify(playersForAdd));

  newPlayers.map((newPlayer) => {
    let newPlayerWithOrdRoles = orderedRoles(newPlayer, state.roles);
    newState.allPlayers.push(newPlayerWithOrdRoles);
    return newPlayer;
  });

  return newState;
}

export function deletePlayers(state, playersIds) {
  let newState = JSON.parse(JSON.stringify(state));
  let arrPlayersIds = JSON.parse(JSON.stringify(playersIds));

  arrPlayersIds.forEach((playerId) => {
    let index = newState.allPlayers.findIndex(
      (element) => element['_id'] === playerId
    );
    newState.allPlayers.splice(index, 1);
  });

  return newState;
}
