import React, { useState } from 'react';
import { useStateValue } from '../../../Context';
// import { NamesScoreWrapper } from '../PlayerFocus/styles';
import { PlayerTotals } from '../PlayerTotals';
import { RolesScore } from '../RolesScore';
import { ScoreWrapper, NamesScoreWrapper, Icon } from './styles';
import { BsInfoCircle } from 'react-icons/bs';
import Swal from 'sweetalert2';
import { Info } from '../Info';

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
export const ScorePlayerFocus = ({
  roles,
  mmr,
  playerId,
  medail,
  handleUpdateMedail,
}) => {
  let [state, setState] = useState({ ...initialRoles });
  const [stateGlobal, dispatch] = useStateValue();
  // TODO: Analizar
  const [functions, setFunction] = useState([]);
  // let functions = []
  // let functions = [];
  function changeState(value, name, rolName) {
    setState({ ...state, [rolName]: { ...state[rolName], [name]: value } });
  }

  function setNameRoles(rolesScore) {
    let keys = Object.keys(rolesScore);
    let newRolesScore = [];
    for (let key of keys) {
      newRolesScore.push({ name: key, score: rolesScore[key] });
    }
    return newRolesScore;
  }

  async function updateScore({
    playerId,
    state: rolesScore,
    mmr,
    medail,
    partidas,
  }) {
    let score = setNameRoles(rolesScore);

    const uri =
      process.env.NODE_ENV === 'development'
        ? '/'
        : 'https://pysabackend.herokuapp.com/';
    let result = await fetch(`${uri}players/updateScore/${playerId}`, {
      method: 'PATCH',
      body: JSON.stringify({ score, mmr, medail, partidas }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((result) => result.json());
    return result;
  }

  async function test(mmr, partidas) {
    Swal.fire({
      title: 'Vas a agregar papu:',
      html: `<b>Hard Carry</b>: ${state['Hard Carry'].victories} <b>V</b> ${state['Hard Carry'].victoriesDouble} <b>x2</b> ${state['Hard Carry'].defeats} <b>D</b> ${state['Hard Carry'].defeatsDouble} <b>x2</b> ${state['Hard Carry'].kills} <b>K</b> ${state['Hard Carry'].deaths} <b>D</b> ${state['Hard Carry'].assists} <b>A</b></br></br>
      <b>Mid Laner</b>: ${state['Mid Laner'].victories} <b>V</b> ${state['Mid Laner'].victoriesDouble} <b>x2</b> ${state['Mid Laner'].defeats} <b>D</b> ${state['Mid Laner'].defeatsDouble} <b>x2</b> ${state['Mid Laner'].kills} <b>K</b> ${state['Mid Laner'].deaths} <b>D</b> ${state['Mid Laner'].assists} <b>A</b></br></br>
      <b>Off Laner</b>: ${state['Off Laner'].victories} <b>V</b> ${state['Off Laner'].victoriesDouble} <b>x2</b> ${state['Off Laner'].defeats} <b>D</b> ${state['Off Laner'].defeatsDouble} <b>x2</b> ${state['Off Laner'].kills} <b>K</b> ${state['Off Laner'].deaths} <b>D</b> ${state['Off Laner'].assists} <b>A</b></br></br>
      <b>Soft Support</b>: ${state['Soft Support'].victories} <b>V</b> ${state['Soft Support'].victoriesDouble} <b>x2</b> ${state['Soft Support'].defeats} <b>D</b> ${state['Soft Support'].defeatsDouble} <b>x2</b> ${state['Soft Support'].kills} <b>K</b> ${state['Soft Support'].deaths} <b>D</b> ${state['Soft Support'].assists} <b>A</b></br></br>
      <b>Hard Support</b>: ${state['Hard Support'].victories} <b>V</b> ${state['Hard Support'].victoriesDouble} <b>x2</b> ${state['Hard Support'].defeats} <b>D</b> ${state['Hard Support'].defeatsDouble} <b>x2</b> ${state['Hard Support'].kills} <b>K</b> ${state['Hard Support'].deaths} <b>D</b> ${state['Hard Support'].assists} <b>A</b></br></br>
      Partidas: ${partidas}
      MMR: ${mmr}
      `,
      showCancelButton: true,
      confirmButtonText: 'Toy seguro',
      cancelButtonText: 'Voa revisar',
      preConfirm: async () => {
        return await updateScore({
          playerId,
          state,
          mmr,
          medail,
          partidas,
        });
      },
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch({ type: 'UPDATE_DATA', payload: result.value.body, playerId });
        console.log(stateGlobal);
        resetInputs();
        Swal.fire({
          title: `Guardado y actualizado con éxito`,
          icon: 'success',
        });
      }
    });
  }

  function resetInputs() {
    let inputs = document.querySelectorAll('input[type=number]');
    for (let input of inputs) {
      input.value = '';
    }

    for (let fn of functions) {
      console.log(fn);
      fn({
        victories: 0,
        victoriesDouble: 0,
        defeats: 0,
        defeatsDouble: 0,
        kills: 0,
        deaths: 0,
        assists: 0,
      });
    }
    setState({ ...initialRoles });
  }

  function getFunction(fn) {
    // TODO: Analizar
    // setFunction([...functions, fn]);
    functions.push(fn);
  }

  function onMouseEnter() {
    let info = document.getElementById('info');
    info.style.display = 'block';
  }
  function onMouseLeave() {
    let info = document.getElementById('info');
    info.style.display = 'none';
  }

  return (
    <ScoreWrapper>
      <NamesScoreWrapper>
        <div className='nameScoreColumn'>
          <div className='wrapperScoreRol'>
            <Info />
            <Icon onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
              <BsInfoCircle />
            </Icon>
            <p>Rol</p>
          </div>
        </div>
        <div className='nameScoreColumn'>
          <p>Victorias</p>
          <div className='scoreColumn__div'>
            <p>A</p>
            <p>E</p>
            <p>M</p>
          </div>
        </div>
        <div className='nameScoreColumn'>
          <p>x2</p>
          <div className='scoreColumn__div'>
            <p>A</p>
            <p>E</p>
            <p>M</p>
          </div>
        </div>
        <div className='nameScoreColumn'>
          <p>Derrotas</p>
          <div className='scoreColumn__div'>
            <p>A</p>
            <p>E</p>
            <p>M</p>
          </div>
        </div>
        <div className='nameScoreColumn'>
          <p>x2</p>
          <div className='scoreColumn__div'>
            <p>A</p>
            <p>E</p>
            <p>M</p>
          </div>
        </div>
        <div className='nameScoreColumn'>
          <p>Kills</p>
          <div className='scoreColumn__div'>
            <p>A</p>
            <p>E</p>
            <p>M</p>
          </div>
        </div>
        <div className='nameScoreColumn'>
          <p>Deaths</p>
          <div className='scoreColumn__div'>
            <p>A</p>
            <p>E</p>
            <p>M</p>
          </div>
        </div>
        <div className='nameScoreColumn'>
          <p>Assists</p>
          <div className='scoreColumn__div'>
            <p>A</p>
            <p>E</p>
            <p>M</p>
          </div>
        </div>
      </NamesScoreWrapper>
      <RolesScore
        roles={roles}
        changeState={changeState}
        getFunction={getFunction}
      />
      <PlayerTotals
        state={{ ...state }}
        roles={calc(roles)}
        mmr={mmr}
        test={test}
        medail={medail}
        resetInputs={resetInputs}
        handleUpdateMedail={handleUpdateMedail}
      />
    </ScoreWrapper>
  );
};
