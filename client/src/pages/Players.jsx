import React from 'react';
import { GetPlayers } from '../container/GetPlayers';
import { PageHeader } from '../components/PageHeader';
import { Page } from '../styles/Page';
import { useLanguage } from '../i18n/LanguageContext';

// The page header (title and refresh) above the player cards.
export const Players = ({ onRefresh }) => {
  const { t } = useLanguage();
  return (
    <Page>
      <PageHeader title={t('players.title')} onRefresh={onRefresh} />
      <GetPlayers user='player' />
    </Page>
  );
};
