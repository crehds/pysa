import React from 'react';
import { Heading, HeadingRow } from './styles';

// Header row of the ranking table.
export const RowsNameRanking = () => {
  return (
    <thead>
      <HeadingRow>
        <Heading scope='col'>#</Heading>
        <Heading scope='col'>Player</Heading>
        <Heading scope='col' $numeric $optional>
          Nº Partidas
        </Heading>
        <Heading scope='col' $numeric>
          MMR
        </Heading>
        <Heading scope='col' $numeric>
          KDA
        </Heading>
        <Heading scope='col' $optional>
          Medalla
        </Heading>
      </HeadingRow>
    </thead>
  );
};
