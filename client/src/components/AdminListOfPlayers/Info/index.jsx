import React from 'react';
import { InfoDetail, InfoWrapper } from './styles';

export const Info = (props) => {
  return (
    <InfoWrapper id='info'>
      <InfoDetail>
        <p>A</p>
        <p>Valor Actual</p>
      </InfoDetail>
      <InfoDetail>
        <p>E</p>
        <p>Valor Editable</p>
      </InfoDetail>
      <InfoDetail>
        <p>M</p>
        <p>Valor Modificado</p>
      </InfoDetail>
    </InfoWrapper>
  );
};
