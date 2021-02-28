import React, { useState } from 'react';
import { NamesScoreWrapper } from '../PlayerFocus/styles';
import { PlayerTotals } from '../PlayerTotals';
import { RolesScore } from '../RolesScore';
import { ScoreWrapper } from './styles';

function calc(score) {
  return score.reduce((acc, cv) => {
    return (acc = {
      ...acc,
      victorias: cv.score.victorias + acc.victorias,
      victoriasDouble: cv.score.victoriasDouble + acc.victoriasDouble,
      derrotas: cv.score.derrotas + acc.derrotas,
      derrotasDouble: cv.score.derrotasDouble + acc.derrotasDouble,
      kills: cv.score.kills + acc.kills,
      deaths: cv.score.deaths + acc.deaths,
      assists: cv.score.assists + acc.assists,
    });
  }, Object.assign({}, initialState));
}

const initialState = {
  victorias: 0,
  victoriasDouble: 0,
  derrotas: 0,
  derrotasDouble: 0,
  kills: 0,
  deaths: 0,
  assists: 0,
};

const initialRoles = {
  'hard carry': {
    ...initialState,
  },
  midlaner: {
    ...initialState,
  },
  offlaner: {
    ...initialState,
  },
  'soft support': {
    ...initialState,
  },
  support: {
    ...initialState,
  },
};
export const ScorePlayerFocus = ({ roles , mmr}) => {
  let [state, setState] = useState({ ...initialRoles });

  function changeState(value, name, rolName) {
    console.log(rolName);
    console.log({...state[rolName] });
    setState({ ...state, [rolName]: { ...state[rolName], [name]: value } });
  }

  return (
    <ScoreWrapper>
      <NamesScoreWrapper>
        <div>
          <p>Rol</p>
        </div>
        <div>
          <p>Victorias</p>
          <div>
            <p>A</p>
            <p>E</p>
            <p>M</p>
          </div>
        </div>
        <div>
          <p>x2</p>
          <div>
            <p>A</p>
            <p>E</p>
            <p>M</p>
          </div>
        </div>
        <div>
          <p>Derrotas</p>
          <div>
            <p>A</p>
            <p>E</p>
            <p>M</p>
          </div>
        </div>
        <div>
          <p>x2</p>
          <div>
            <p>A</p>
            <p>E</p>
            <p>M</p>
          </div>
        </div>
        <div>
          <p>Kills</p>
          <div>
            <p>A</p>
            <p>E</p>
            <p>M</p>
          </div>
        </div>
        <div>
          <p>Deaths</p>
          <div>
            <p>A</p>
            <p>E</p>
            <p>M</p>
          </div>
        </div>
        <div>
          <p>Assists</p>
          <div>
            <p>A</p>
            <p>E</p>
            <p>M</p>
          </div>
        </div>
      </NamesScoreWrapper>
      <RolesScore roles={roles} changeState={changeState} />
      <PlayerTotals state={{ ...state }} roles={calc(roles)} mmr={mmr} />
    </ScoreWrapper>
  );
};
