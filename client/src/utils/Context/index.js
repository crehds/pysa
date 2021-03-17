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
