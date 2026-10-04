import React from 'react';

import { ExternalItem, Item, LogoLink, NavBarContainer } from './styles';
import { ImTable, ImProfile, ImUsers } from 'react-icons/im';
import { CgGames } from 'react-icons/cg';
import logo from '../../assets/logopysa_90x90.png';

// `children` is the login/logout control: it sits last, at the bottom of the
// rail, inside this same <nav> (there is only one navigation on the page).
export const NavBar = ({ isLogging, children }) => {
  return (
    <NavBarContainer>
      <LogoLink to='/'>
        <img src={logo} alt='logo pysa' />
      </LogoLink>
      <Item to='/' end>
        <ImTable aria-hidden='true' />
        Ranking
      </Item>
      <Item to='/players'>
        <ImProfile aria-hidden='true' />
        Jugadores
      </Item>
      {isLogging && (
        <Item to='/adminPlayers'>
          <ImUsers aria-hidden='true' />
          Admin
        </Item>
      )}
      <ExternalItem
        href='https://game-with-keyboard.vercel.app/'
        target='_blank'
        rel='noopener noreferrer'
      >
        <CgGames aria-hidden='true' />
        Juego
      </ExternalItem>
      {children}
    </NavBarContainer>
  );
};
