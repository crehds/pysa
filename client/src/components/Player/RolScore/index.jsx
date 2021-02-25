import React from 'react';
import { RolScoreWrapper } from './styles';

export const RolScore = (props) => {
  const {
    victorias,
    victoriasDouble,
    derrotas,
    derrotasDouble,
    kills,
    deaths,
    assists,
  } = props.score;
  return (
    <RolScoreWrapper>
      <div>
        <p>{props.nombre} </p>
      </div>
      <div>
        <p>{victorias}</p>
      </div>
      <div>
        <p>{victoriasDouble}</p>
      </div>
      <div>
        <p>{derrotas}</p>
      </div>
      <div>
        <p>{derrotasDouble}</p>
      </div>
      <div>
        <p>{kills}</p>
      </div>
      <div>
        <p>{deaths}</p>
      </div>
      <div>
        <p>{assists}</p>
      </div>
    </RolScoreWrapper>
  );
};
