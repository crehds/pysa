import React from 'react';
import { FocusWrapper, ImageWrapper, NameWrapper } from './styles';
import user from '../../../assets/default-user.png';
import { ScorePlayerFocus } from '../ScorePlayerFocus';

export const PlayerFocus = ({ player }) => {
  return (
    <FocusWrapper>
      <div>
        <NameWrapper>
          <h1>{player.nickname}</h1>
        </NameWrapper>
        <ImageWrapper>
          <img src={user} alt='imagen del jugador' />
        </ImageWrapper>
      </div>
      <ScorePlayerFocus roles={player.rolesScore} mmr={player.mmr} />
      
    </FocusWrapper>
  );
};
