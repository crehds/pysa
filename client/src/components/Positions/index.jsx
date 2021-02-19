import React from 'react';
import { Position, PositionsContainer } from './styles';

export const Positions = ({ positions }) => {
  return (
    <PositionsContainer>
      {new Array(positions).fill(0).map((e, i) => (
        <Position key={i}>{i + 1}</Position>
      ))}
    </PositionsContainer>
  );
};
