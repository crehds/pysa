import React from 'react';
import { GiMedal } from 'react-icons/gi';
import { Icon, ImageWrapper, NamePlayer, PlayerImageWrapper } from './styles';
import user from '../../../assets/default-user.png';

export const PlayerImageMedail = ({ name, medail, mmr, src, size }) => {
  console.log(size);
  return (
    <PlayerImageWrapper size={size}>
      <NamePlayer className='playerName'>
        <p>{name}</p>
      </NamePlayer>
      <Icon className='icon'>
        <GiMedal />
        <p>{medail}</p>
        <p>{mmr}</p>
      </Icon>
      <ImageWrapper>
        <img src={src} alt='foto del jugador' />
      </ImageWrapper>
    </PlayerImageWrapper>
  );
};
