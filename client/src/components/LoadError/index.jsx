import React from 'react';
import logo from '../../assets/logopysa_90x90.png';
import { Screen } from '../initLoading/styles';
import { Message, RetryButton } from './styles';

// Shown instead of the app when the data could not be loaded. It is its own
// screen (the menu and pages need data), and it never says "no players": a
// failed request is not an empty ranking.
export const LoadError = ({ onRetry }) => (
  <Screen>
    <img src={logo} alt='' width='90' height='90' />
    <div role='alert'>
      <Message>No pudimos cargar el ranking.</Message>
    </div>
    <RetryButton type='button' onClick={onRetry}>
      Reintentar
    </RetryButton>
  </Screen>
);
