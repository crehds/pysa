import React from 'react';
import { RowPlayerRanking } from '../RowPlayerRanking';
import { PlayersData } from './styles';

export const PlayersInRanking = ({ players }) => {
  return (
    <PlayersData>
      {players.map((player, i) => (
        <RowPlayerRanking
          key={i}
          name={player.nickname}
          partidas={player.partidas}
          mmr={player.mmr}
          medail={player.medail}
          kda={player.kda}
        />
      ))}
    </PlayersData>
  );
};
