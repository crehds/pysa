import React from 'react';
import { Icon, ImgWrapper, NavBarContainer } from './styles';
import { ImTable, ImProfile, ImUsers } from 'react-icons/im';
import logo from '../../assets/logopysa_90x90.png';

export const NavBar = ({isLogging}) => {
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
      {isLogging && <Icon to='/adminPlayers'>
        <ImUsers />
      </Icon>}
    </NavBarContainer>
  );
};
