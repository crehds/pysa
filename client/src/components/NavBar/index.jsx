import React from 'react';

import { Anchor, Icon, ImgWrapper, NavBarContainer } from './styles';
import { ImTable, ImProfile, ImUsers } from 'react-icons/im';
import { CgGames } from 'react-icons/cg';
import logo from '../../assets/logopysa_90x90.png';

export const NavBar = ({ isLogging }) => {
  return (
    <NavBarContainer>
      <ImgWrapper>
        <img src={logo} alt='logo pysa' />
      </ImgWrapper>
      <Icon to='/'>
        <ImTable />
      </Icon>
      <Icon to='/players'>
        <ImProfile />
      </Icon>
      {isLogging && (
        <Icon to='/adminPlayers'>
          <ImUsers />
        </Icon>
      )}
      <Anchor href='https://game-with-keyboard.vercel.app/' target='_blank'>
        <CgGames />
      </Anchor>
    </NavBarContainer>
  );
};
