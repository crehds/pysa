import React from 'react';
import { RowPlayerRanking } from '../RowPlayerRanking';
import { PlayersData } from './styles';

export const PlayersInRanking = ({ players }) => {
  return (
    <PlayersData>
      {players.map((player, i) => (
        <RowPlayerRanking
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
