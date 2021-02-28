import React from 'react';
import { Arrow, ToFocusWrapper } from './styles';

export const PlayerToFocus = ({ dispatch, direction, player }) => {
  return (
    <ToFocusWrapper >
      <div>
        <h2>{player}</h2>
      </div>
      <Arrow className={direction} onClick={() => dispatch({ type: direction })}>
        <i className={`icon-keyboard_arrow_${direction}`}></i>
      </Arrow>
    </ToFocusWrapper>
  );
};
