import React from 'react';
import { RowPlayerRanking } from '../RowPlayerRanking';

export const PlayersInRanking = ({ players, startRank = 1 }) => {
  return (
    <tbody>
      {players.map((player, i) => (
        <RowPlayerRanking
          key={player._id ?? i}
          rank={startRank + i}
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
