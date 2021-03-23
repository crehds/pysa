import React from 'react';
import { GiMedal } from 'react-icons/gi';
import { Icon, ImageWrapper, NamePlayer, PlayerImageWrapper } from './styles';
import user from '../../../assets/default-user.png';

export const PlayerImageMedail = ({ name, medail, mmr, src, size }) => {
  const regex = /^[/][a-z]+[/].*/gi;
  const imageSrc =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:4000'
      : 'https://pysabackend.herokuapp.com';
  const imgData = regex.test(src)
    ? `${imageSrc}${src}`
    : `data:image/${src.mimetype};base64,${src.data}`;
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
