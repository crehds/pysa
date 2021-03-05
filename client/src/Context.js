import React, { createContext, useContext, useReducer } from 'react';
import { players } from './api/players2.json';
import { medallas } from './api/medallas.json';
const Context = createContext();

let initialState = {};

const reducer = function reducer(roles, mmrPerV, mmrPerD, initialMMR) {
  let partidas = 0;
  console.log(roles);
  let sumaMMR = roles.reduce((acc, cv) => {
    partidas +=
      cv.score.victorias +
      cv.score.derrotas +
      cv.score.victoriasDouble +
      cv.score.derrotasDouble;
    return (
      (acc +=
        cv.score.victorias * mmrPerV + cv.score.victoriasDouble * mmrPerV * 2) -
      cv.score.derrotas * mmrPerD +
      cv.score.derrotasDouble * mmrPerD * 2
    );
  }, initialMMR);

  return { sumaMMR, partidas };
};

function calcMMR(players) {
  return players
    .filter((player) => player.estado === 1)
    .map((player) => {
      if (player.calibracion.estado === 1) {
        // let initialMMR = player.mmr === 0 ? 1800 : player.mmr
        let { sumaMMR, partidas } = reducer(player.roles, 100, 100, 1800);
        return { ...player, sumaMMR, partidas };
      } else {
        let { sumaMMR, partidas } = reducer(player.roles, 100, 100, player.mmr);
        return { ...player, sumaMMR, partidas };
      }
    });
}

function sortPlayers(players) {
  return players.sort((a, b) => {
    if (b.mmr === a.mmr) {
      return b.kda - a.kda;
    }
    return b.mmr - a.mmr;
  });
}

function setMedallas(playersOrdenados) {
  return playersOrdenados.map((player) => {
    let medail = medallas.find(
      (medalla) =>
        medalla.minimo < player.sumaMMR && player.sumaMMR <= medalla.maximo
    );
    return { ...player, medail: medail.nombre };
  });
}

function playersFiltering(players, score) {
  const filteredPlayers = players.filter(
    (player) => player.estado === true && player.medail !== 'Sin Calibrar'
  );

  const playersWithScore = filteredPlayers.map((player) => {
    let rolesScore = score.find((score) => player['_id'] === score.playerId)
      .rolesScore;
    return { ...player, rolesScore };
  });

  return playersWithScore;
}

function setKDAAndMedail(players, medails, roles) {
  // console.log(players);
  // console.log(roles);
  const results = players.map((player) => {
    let partidas = 0;
    // console.log(players);
    let rolScoreOrd = roles.map((rol) => {
      let sortRol = player.rolesScore.find(
        (rolScore) => rolScore.rol === rol['_id']
      );
      return { ...sortRol, rol: rol.name };
    });

    player.rolesScore = rolScoreOrd;
    
    let obj = player.rolesScore.reduce(
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
    kda = kda.length === 4 ? kda : kda.length === 1 ? `${kda}.00` : `${kda}0`
    let medailName = medails.find((medail) => player.medail === medail['_id'])
      .name;
    return { ...player, kda, partidas, medail: medailName };
  });
  return results;
}

function dataForRanking({ players, scorePlayers, medails, roles }) {
  const filteredPlayers = playersFiltering(players, scorePlayers);
  const playersWithAllData = setKDAAndMedail(filteredPlayers, medails, roles);

  const orderedPlayers = sortPlayers(playersWithAllData);
  return orderedPlayers;
}

const reducer2 = (state, action) => {
  switch (action.type) {
    case 'SET_DATA':
      console.log(action.payload);
      let ranking = dataForRanking({ ...action.payload });
      console.log(ranking);
      return {
        ...state,
        ...action.payload,
        ranking,
      };
    case 'UNLOGIN':
      window.sessionStorage.removeItem('token');
      return {
        ...state,
        isAuth: false,
      };
    default:
      return state;
  }
};
// const initialState = getData();
// console.log(initialState);
// let playersWidthMMR = calcMMR(players);
// console.log(playersWidthMMR);
// let playersOrdenados = ordenamiento(playersWidthMMR);
// const playersWithMedals = setMedallas(playersOrdenados);

// export const Provider = ({ children }) => (
//   <Context.Provider value={playersWithMedals}>{children}</Context.Provider>
// );

export const Provider = ({ children }) => (
  <Context.Provider value={useReducer(reducer2, initialState)}>
    {children}
  </Context.Provider>
);

export const useStateValue = () => useContext(Context);
