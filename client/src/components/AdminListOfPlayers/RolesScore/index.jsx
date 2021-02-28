import React from 'react';
import { RolScore} from '../../AdminListOfPlayers/RolScore'
import { RolesScoreWrapper } from './styles';

export const RolesScore = (props) => {
  return (
    <RolesScoreWrapper>
      {props.roles.map((rol, i) => (
        <RolScore rol={rol} key={i} changeState={props.changeState} />
      ))}
    </RolesScoreWrapper>
  );
};
