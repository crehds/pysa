import React, { createContext, useContext } from 'react';
import { players } from './api/players.json';
import { medallas } from './api/medallas.json';
const Context = createContext();

function reducer(roles, mmrPerV, mmrPerD, initialMMR) {
  let partidas = 0;
  let sumaMMR = roles.reduce((acc, cv) => {
    partidas += cv.score.victorias + cv.score.derrotas;
    return (acc += cv.score.victorias * mmrPerV) - cv.score.derrotas * mmrPerD;
  }, initialMMR);

  return { sumaMMR, partidas };
}

function calcMMR(players) {
  return players.map((player) => {
    if (player.calibracion.estado === 1) {
      // let initialMMR = player.mmr === 0 ? 1800 : player.mmr
      let { sumaMMR, partidas } = reducer(player.roles, 100, 80, 1800);
      return { ...player, sumaMMR, partidas };
    } else {
      let { sumaMMR, partidas } = reducer(player.roles, 50, 30, player.mmr);
      return { ...player, sumaMMR, partidas };
    }
  });
}

function ordenamiento(playersWidthMMR) {
  return playersWidthMMR.sort((a, b) => b.sumaMMR - a.sumaMMR);
}

function setMedallas(playersOrdenados) {
  return playersOrdenados.map((player) => {
    let medail = medallas.find(
      (medalla) =>
        medalla.minimo < player.sumaMMR && medalla.maximo >= player.sumaMMR
    );
    return { ...player, medail: medail.nombre };
  });
}

let playersWidthMMR = calcMMR(players);
let playersOrdenados = ordenamiento(playersWidthMMR);
const playersWithMedals = setMedallas(playersOrdenados);

export const Provider = ({ children }) => (
  <Context.Provider value={playersWithMedals}>{children}</Context.Provider>
);

export const useStateValue = () => useContext(Context);