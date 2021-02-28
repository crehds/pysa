import React, { useState } from 'react';
import { RolScoreWrapper } from './styles';

function copyKeys(obj) {
  let keys = Object.keys(obj);
  let result = {};
  for (let key of keys) {
    result[key] = 0;
  }
  return result;
}

export const RolScore = (props) => {
  const [state, setState] = useState(copyKeys({ ...props.rol.score }));
  function onChange(event) {
    let value = event.target.value ? parseInt(event.target.value) : 0;
    let name = event.target.name;
    let rolName = props.rol.nombre;
    setState({ ...state, [name]: value });
    props.changeState(value, name, rolName);
  }
  return (
    <RolScoreWrapper>
      <div>{props.rol.nombre}</div>
      <div>
        <p>{props.rol.score.victorias} </p>
        <input name='victorias' placeholder='0' onChange={onChange} />
        <p>{props.rol.score.victorias + state.victorias} </p>
      </div>
      <div>
        <p>{props.rol.score.victoriasDouble}</p>
        <input name='victoriasDouble' placeholder='0' onChange={onChange} />
        <p>{props.rol.score.victoriasDouble + state.victoriasDouble}</p>
      </div>
      <div>
        <p>{props.rol.score.derrotas}</p>
        <input name='derrotas' placeholder='0' onChange={onChange} />
        <p>{props.rol.score.derrotas + state.derrotas}</p>
      </div>
      <div>
        <p>{props.rol.score.derrotasDouble}</p>
        <input name='derrotasDouble' placeholder='0' onChange={onChange} />
        <p>{props.rol.score.derrotasDouble + state.derrotasDouble}</p>
      </div>
      <div>
        <p>{props.rol.score.kills}</p>
        <input name='kills' placeholder='0' onChange={onChange} />
        <p>{props.rol.score.kills + state.kills}</p>
      </div>
      <div>
        <p>{props.rol.score.deaths}</p>
        <input name='deaths' placeholder='0' onChange={onChange} />
        <p>{props.rol.score.deaths + state.deaths}</p>
      </div>
      <div>
        <p>{props.rol.score.assists}</p>
        <input name='assists' placeholder='0' onChange={onChange} />
        <p>{props.rol.score.assists + state.assists}</p>
      </div>
    </RolScoreWrapper>
  );
};
