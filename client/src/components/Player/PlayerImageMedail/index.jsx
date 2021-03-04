import React from 'react';
import { GiMedal } from 'react-icons/gi';
import { Icon, ImageWrapper, NamePlayer, PlayerImageWrapper } from './styles';
import user from '../../../assets/default-user.png';

export const PlayerImageMedail = ({ name, medail, mmr }) => {
  return (
    <PlayerImageWrapper>
      <NamePlayer>
        <p>{name}</p>
      </NamePlayer>
      <Icon>
        <GiMedal />
        <p>{medail}</p>
        <p>{mmr}</p>
      </Icon>
      <ImageWrapper>
        <img src={user} alt='foto del jugador' />
      </ImageWrapper>
    </PlayerImageWrapper>
  );
};
