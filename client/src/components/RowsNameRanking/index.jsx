import React from 'react';
import { ImTrophy } from 'react-icons/im';
import { Name, RowName, RowsNames } from './styles';

export const RowsNameRanking = () => {
  return (
    <RowsNames>
      <RowName>
        <ImTrophy color='gold' size='36px' />
      </RowName>
      <RowName>
        <Name>Player</Name>
      </RowName>
      <RowName>
        <Name>Nº de partidas</Name>
      </RowName>
      <RowName>
        <Name>MMR</Name>
      </RowName>
      <RowName>
        <Name>Medalla</Name>
      </RowName>
    </RowsNames>
  );
};
