import React from 'react';
import { PlayerData, Player as P } from './styles';

export const RowPlayerRanking = ({ name, partidas, mmr, medail }) => {
  return (
    <PlayerData>
      <P>{name}</P>
      <P>{partidas}</P>
      <P>{mmr}</P>
      <P>{medail}</P>
    </PlayerData>
  );
};
