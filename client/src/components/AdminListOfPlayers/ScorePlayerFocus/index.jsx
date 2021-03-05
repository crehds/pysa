import React, { useState } from 'react';
import { NamesScoreWrapper } from '../PlayerFocus/styles';
import { PlayerTotals } from '../PlayerTotals';
import { RolesScore } from '../RolesScore';
import { ScoreWrapper } from './styles';

function calc(score) {
  return score.reduce((acc, cv) => {
    return (acc = {
      ...acc,
      victories: cv.victories + acc.victories,
      victoriesDouble: cv.victoriesDouble + acc.victoriesDouble,
      defeats: cv.defeats + acc.defeats,
      defeatsDouble: cv.defeatsDouble + acc.defeatsDouble,
      kills: cv.kills + acc.kills,
      deaths: cv.deaths + acc.deaths,
      assists: cv.assists + acc.assists,
    });
  }, Object.assign({}, initialState));
}

const initialState = {
  victories: 0,
  victoriesDouble: 0,
  defeats: 0,
  defeatsDouble: 0,
  kills: 0,
  deaths: 0,
  assists: 0,
};

const initialRoles = {
  'Hard Carry': {
    ...initialState,
  },
  'Mid Laner': {
    ...initialState,
  },
  'Off Laner': {
    ...initialState,
  },
  'Soft Support': {
    ...initialState,
  },
  'Hard Support': {
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
        <div className='rolTitle'>
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
