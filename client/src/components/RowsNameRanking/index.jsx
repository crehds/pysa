import React from 'react';
import { Heading, HeadingRow } from './styles';

// Header row of the ranking table. `medalInfo` is the icon that shows the medal
// ranges; it lives in the Medalla header.
export const RowsNameRanking = ({ medalInfo }) => {
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
          {medalInfo}
        </Heading>
      </HeadingRow>
    </thead>
  );
};
