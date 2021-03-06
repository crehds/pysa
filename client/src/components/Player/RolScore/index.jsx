import React from 'react';
import { RolScoreWrapper } from './styles';

export const RolScore = (props) => {
  const {
    victories,
    victoriesDouble,
    defeats,
    defeatsDouble,
    kills,
    deaths,
    assists,
  } = props;
  return (
    <RolScoreWrapper>
      <div>
        <p>{props.rol} </p>
      </div>
      <div>
        <p>{victories}</p>
      </div>
      <div>
        <p>{victoriesDouble}</p>
      </div>
      <div>
        <p>{defeats}</p>
      </div>
      <div>
        <p>{defeatsDouble}</p>
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
