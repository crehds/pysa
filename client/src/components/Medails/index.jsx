import React from 'react';
import { MedailsDiv, GridDiv } from './styles';

export const Medails = () => {
  return (
    <MedailsDiv id='medails'>
      <GridDiv>
        <p>Mínimo</p>
        <p>Máximo</p>
        <p>Medalla</p>
      </GridDiv>
      <GridDiv>
        <p>0</p>
        <p>600</p>
        <p>Heraldo</p>
      </GridDiv>
      <GridDiv>
        <p>601</p>
        <p>1200</p>
        <p>Guardián</p>
      </GridDiv>
      <GridDiv>
        <p>1201</p>
        <p>1800</p>
        <p>Cruzado</p>
      </GridDiv>
      <GridDiv>
        <p>1801</p>
        <p>2400</p>
        <p>Arconte</p>
      </GridDiv>
      <GridDiv>
        <p>2401</p>
        <p>3000</p>
        <p>Leyenda</p>
      </GridDiv>
      <GridDiv>
        <p>3001</p>
        <p>3600</p>
        <p>Ancient</p>
      </GridDiv>
      <GridDiv>
        <p>3601</p>
        <p>4200</p>
        <p>Divino</p>
      </GridDiv>
      <GridDiv>
        <p>4201</p>
        <p>4800</p>
        <p>Inmortal</p>
      </GridDiv>
    </MedailsDiv>
  );
};
