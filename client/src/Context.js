import React, { createContext, useContext } from 'react';
import { players } from './api/players.json';
import { medallas } from './api/medallas.json';
const Context = createContext();

function reducer(roles, mmrPerV, mmrPerD, initialMMR) {
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
}

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

function ordenamiento(playersWidthMMR) {
  return playersWidthMMR.sort((a, b) => {
    if (b.sumaMMR === a.sumaMMR) {
      return a.partidas - b.partidas;
    }
    return b.sumaMMR - a.sumaMMR;
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

let playersWidthMMR = calcMMR(players);
console.log(playersWidthMMR);
let playersOrdenados = ordenamiento(playersWidthMMR);
const playersWithMedals = setMedallas(playersOrdenados);

export const Provider = ({ children }) => (
  <Context.Provider value={playersWithMedals}>{children}</Context.Provider>
);

export const useStateValue = () => useContext(Context);
