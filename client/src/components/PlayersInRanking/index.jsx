import React from 'react';
import { RowPlayerRanking } from '../RowPlayerRanking';

export const PlayersInRanking = ({ players }) => {
  return (
    <tbody>
      {players.map((player, i) => (
        <RowPlayerRanking
          key={i}
          rank={i + 1}
          name={player.nickname}
          partidas={player.partidas}
          mmr={player.mmr}
          medail={player.medail}
          kda={player.kda}
        />
      ))}
    </tbody>
  );
};
