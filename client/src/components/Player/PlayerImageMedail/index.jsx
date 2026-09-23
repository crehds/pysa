import React from 'react';
import { GiMedal } from 'react-icons/gi';
import { Icon, ImageWrapper, NamePlayer, PlayerImageWrapper } from './styles';
import { playerImageSrc } from '../../../utils/playerImage';

export const PlayerImageMedail = ({ name, medail, mmr, src, size }) => {
  const imgData = playerImageSrc(src);
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
        <img src={`${imgData}`} alt='foto del jugador' />
      </ImageWrapper>
    </PlayerImageWrapper>
  );
};
