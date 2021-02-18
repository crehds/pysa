import React from 'react';
import { PlayerData } from './styles';

export const Player = ({ name, partidas, mmr, medail }) => {
  return (
    <PlayerData>
      <div>{name}</div>
      <div>{partidas}</div>
      <div>{mmr}</div>
      <div>{medail}</div>
    </PlayerData>
  );
};
