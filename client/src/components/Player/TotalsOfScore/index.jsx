import React from 'react';
import { Total, TotalsWrapper, Partidas } from './styles';

export const TotalsOfScore = ({
  victories,
  defeats,
  kills,
  deaths,
  assists,
}) => {
  return (
    <TotalsWrapper>
      <Total>
        <p>TOTAL</p>
      </Total>
      <p>{victories} </p>
      <p>{defeats}</p>
      <p>{kills}</p>
      <p>{deaths}</p>
      <p>{assists}</p>
      <Partidas>{victories + defeats} </Partidas>
    </TotalsWrapper>
  );
};
