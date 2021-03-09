import React, { createContext, useContext, useReducer } from 'react';
import { players } from './api/players2.json';
import { medallas } from './api/medallas.json';
const Context = createContext();

let initialState = {
  isAuth: window.sessionStorage.getItem('token'),
};

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

function setScoreOfPlayers(players, score) {
  const playersWithScore = players.map((player) => {
    let rolesScore = score.find((score) => player['_id'] === score.playerId)
      .rolesScore;
    return { ...player, rolesScore };
  });

  return playersWithScore;
}

function setKDAAndMedail(players, medails, roles) {
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
    kda = kda.length === 4 ? kda : kda.length === 1 ? `${kda}.00` : `${kda}0`;

    if (player.medail !== 'Sin Calibrar') {
      player.medail = medails.find(
        (medail) => player.medail === medail['_id']
      ).name;
    }

    return {
      ...player,
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

function dataForApp({ players, scorePlayers, medails, roles }) {
  const playersWithScore = setScoreOfPlayers(players, scorePlayers);
  const playersWithAllData = setKDAAndMedail(playersWithScore, medails, roles);
  const filteredPlayers = filteringPlayers(playersWithAllData);
  const orderedPlayers = sortPlayers(filteredPlayers);

  return { orderedPlayers, playersWithAllData };
}

function setNameRoles(rolesScore) {
  let keys = Object.keys(rolesScore);
  let newRolesScore = [];
  for (let key of keys) {
    newRolesScore.push({ name: key, score: rolesScore[key] });
  }
  return newRolesScore;
}

async function updateScore({
  playerId,
  state: rolesScore,
  mmr,
  medail,
  partidas,
}) {
  let score = setNameRoles(rolesScore);
  
  const uri =
          process.env.NODE_ENV === 'development'
            ? '/'
            : 'https://pysabackend.herokuapp.com/';
  let result = await fetch(`${uri}players/updateScore/${playerId}`, {
    method: 'PATCH',
    body: JSON.stringify({ score, mmr, medail, partidas }),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((result) => result.json());
  console.log(result);
}

const reducer2 = (state, action) => {
  switch (action.type) {
    case 'SET_DATA':
      console.log(action.payload);
      let data = dataForApp({ ...action.payload });
      console.log(data);
      return {
        ...state,
        ...action.payload,
        ranking: data.orderedPlayers,
        allPlayers: data.playersWithAllData,
      };
    case 'SEND_DATA':
      updateScore({ ...action.payload });

      return {
        ...state,
      };
    case 'LOGIN':
      return {
        ...state,
        isAuth: true,
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
