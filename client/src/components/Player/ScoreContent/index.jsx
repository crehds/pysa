import React from 'react';
import { RolScore } from '../RolScore';
import { TotalsOfScore } from '../TotalsOfScore';
import { ScoreContentWrapper } from './styles';

export const ScoreContent = ({ roles }) => {
  let state = {
    victorias: 0,
    derrotas: 0,
    kills: 0,
    deaths: 0,
    assists: 0,
  };

  function reducer(newState) {
    state = {
      ...state,
      victorias:
        state.victorias +
        newState.score.victorias +
        newState.score.victoriasDouble,
      derrotas:
        state.derrotas +
        newState.score.derrotas +
        newState.score.derrotasDouble,
      kills: state.kills + newState.score.kills,
      deaths: state.deaths + newState.score.deaths,
      assists: state.assists + newState.score.assists,
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
