import React from 'react';
import { Total, TotalsWrapper, Partidas, KDA } from './styles';

export const TotalsOfScore = ({
  victories,
  defeats,
  kills,
  deaths,
  assists,
  kda,
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
      <KDA>{kda} </KDA>
    </TotalsWrapper>
  );
};
