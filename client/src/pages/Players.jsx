import React from 'react';
import { GetPlayers } from '../container/GetPlayers';
import { PageHeader } from '../components/PageHeader';
import { Page } from '../styles/Page';

// The page header (title and refresh) above the player cards.
export const Players = ({ onRefresh }) => (
  <Page>
    <PageHeader title='Jugadores' onRefresh={onRefresh} />
    <GetPlayers user='player' />
  </Page>
);
