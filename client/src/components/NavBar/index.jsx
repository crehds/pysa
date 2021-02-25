import React from 'react';
import { Icon, ImgWrapper, NavBarContainer } from './styles';
import { ImTable, ImProfile } from 'react-icons/im';
import logo from '../../assets/logopysa_90x90.png';

export const NavBar = () => {
  return (
    <NavBarContainer>
      <ImgWrapper>
        <img src={logo} alt="logo pysa"/>
      </ImgWrapper>
      <Icon>
        <ImTable />
      </Icon>
      <Icon>
        <ImProfile />
      </Icon>
    </NavBarContainer>
  );
};
