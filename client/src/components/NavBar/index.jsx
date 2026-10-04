import React from 'react';

import { ExternalItem, HideButton, Item, LogoLink, NavBarContainer } from './styles';
import { ImTable, ImProfile, ImUsers, ImArrowLeft2 } from 'react-icons/im';
import { CgGames } from 'react-icons/cg';
import logo from '../../assets/logopysa_90x90.png';

export const NAV_ID = 'main-nav';

// `children` is the login/logout control: it sits at the bottom of the rail,
// inside this same <nav> (there is only one navigation on the page). The hide
// button comes after it and only exists on the rail (from md up).
export const NavBar = ({ isLogging, children, menuHidden, onHide, hideButtonRef }) => {
  return (
    <NavBarContainer id={NAV_ID} $hidden={menuHidden}>
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
      <HideButton
        type='button'
        ref={hideButtonRef}
        onClick={onHide}
        aria-expanded={!menuHidden}
        aria-controls={NAV_ID}
      >
        <ImArrowLeft2 aria-hidden='true' />
        Ocultar menú
      </HideButton>
    </NavBarContainer>
  );
};
