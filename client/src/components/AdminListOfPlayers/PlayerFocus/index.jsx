import React from 'react';
import { FocusWrapper, ImageWrapper, NameWrapper } from './styles';
import user from '../../../assets/default-user.png';
import { ScorePlayerFocus } from '../ScorePlayerFocus';

export const PlayerFocus = ({ player }) => {
  return (
    <FocusWrapper>
      <div>
        <NameWrapper>
          <h1>{player.nombre}</h1>
        </NameWrapper>
        <ImageWrapper>
          <img src={user} alt='imagen del jugador' />
        </ImageWrapper>
      </div>
      <ScorePlayerFocus roles={player.roles} mmr={player.sumaMMR} />
      
    </FocusWrapper>
  );
};
