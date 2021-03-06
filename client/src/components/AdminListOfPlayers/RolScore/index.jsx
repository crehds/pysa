import React, { useState } from 'react';
import { RolScoreWrapper } from './styles';

// function copyKeys(obj) {
//   let keys = Object.keys(obj);
//   let result = {};
//   for (let key of keys) {
//     result[key] = 0;
//   }
//   return result;
// }

const initialState = {
  victories: 0,
  victoriesDouble: 0,
  defeats: 0,
  defeatsDouble: 0,
  kills: 0,
  deaths: 0,
  assists: 0,
};

export const RolScore = (props) => {
  const [state, setState] = useState(initialState);

  function onChange(event) {
    let value = event.target.value ? parseInt(event.target.value) : 0;
    let name = event.target.name;
    let rolName = props.rol;
    setState({ ...state, [name]: value });
    props.changeState(value, name, rolName);
  }
  // console.log(props);
  return (
    <RolScoreWrapper>
      <div>{props.rol}</div>
      <div>
        <p>{props.victories} </p>
        <input name='victories' placeholder='0' onChange={onChange} />
        <p>{props.victories + state.victories} </p>
      </div>
      <div>
        <p>{props.victoriesDouble}</p>
        <input name='victoriesDouble' placeholder='0' onChange={onChange} />
        <p>{props.victoriesDouble + state.victoriesDouble}</p>
      </div>
      <div>
        <p>{props.defeats}</p>
        <input name='defeats' placeholder='0' onChange={onChange} />
        <p>{props.defeats + state.defeats}</p>
      </div>
      <div>
        <p>{props.defeatsDouble}</p>
        <input name='defeatsDouble' placeholder='0' onChange={onChange} />
        <p>{props.defeatsDouble + state.defeatsDouble}</p>
      </div>
      <div>
        <p>{props.kills}</p>
        <input name='kills' placeholder='0' onChange={onChange} />
        <p>{props.kills + state.kills}</p>
      </div>
      <div>
        <p>{props.deaths}</p>
        <input name='deaths' placeholder='0' onChange={onChange} />
        <p>{props.deaths + state.deaths}</p>
      </div>
      <div>
        <p>{props.assists}</p>
        <input name='assists' placeholder='0' onChange={onChange} />
        <p>{props.assists + state.assists}</p>
      </div>
    </RolScoreWrapper>
  );
};
