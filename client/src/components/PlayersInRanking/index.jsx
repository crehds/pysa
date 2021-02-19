import React from 'react';
import { Player } from '../Player';
import { PlayersData } from './styles';

export const PlayersInRanking = ({ players }) => {
  return (
    <PlayersData>
      {players.map((player, i) => (
        <Player
          key={i}
          name={player.nombre}
          partidas={player.partidas}
          mmr={player.sumaMMR}
          medail={player.medail}
        />
      ))}
    </PlayersData>
  );
};
