import React from 'react';
import { PlayerData, Player as P } from './styles';

export const RowPlayerRanking = ({ name, partidas, mmr, kda, medail }) => {
  return (
    <PlayerData>
      <P>{name}</P>
      <P>{partidas}</P>
      <P>{mmr}</P>
      <P>{kda}</P>
      <P>{medail}</P>
    </PlayerData>
  );
};
