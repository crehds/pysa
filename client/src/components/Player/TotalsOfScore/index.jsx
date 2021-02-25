import React from 'react';
import { Total, TotalsWrapper, Partidas } from './styles';

export const TotalsOfScore = ({
  victorias,
  derrotas,
  kills,
  deaths,
  assists,
}) => {
  return (
    <TotalsWrapper>
      <Total>
        <p>TOTAL</p>
      </Total>
      <p>{victorias} </p>
      <p>{derrotas}</p>
      <p>{kills}</p>
      <p>{deaths}</p>
      <p>{assists}</p>
      <Partidas>{victorias + derrotas} </Partidas>
    </TotalsWrapper>
  );
};
