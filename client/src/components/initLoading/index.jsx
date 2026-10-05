import React from 'react';
import logo from '../../assets/logo_pysa_6.png';
import { Img, Screen } from './styles.jsx';

export const Loading = () => (
  <Screen role='status' aria-label='Cargando'>
    <Img src={logo} alt='logo de pysa' />
  </Screen>
);
