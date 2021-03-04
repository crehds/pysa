import React from 'react';
import { RolScore } from '../RolScore';
import { TotalsOfScore } from '../TotalsOfScore';
import { ScoreContentWrapper } from './styles';

export const ScoreContent = ({ roles }) => {
  let state = {
    victories: 0,
    defeats: 0,
    kills: 0,
    deaths: 0,
    assists: 0,
  };

  function reducer(newState) {
    state = {
      ...state,
      victories:
        state.victories +
        newState.victories +
        newState.victoriesDouble,
      defeats:
        state.defeats +
        newState.defeats +
        newState.defeatsDouble,
      kills: state.kills + newState.kills,
      deaths: state.deaths + newState.deaths,
      assists: state.assists + newState.assists,
    };
  }
  return (
    <ScoreContentWrapper>
      {roles.map((rol, i) => {
        reducer(rol);
        return <RolScore key={i} {...rol} />;
      })}
      <TotalsOfScore {...state} />
    </ScoreContentWrapper>
  );
};
