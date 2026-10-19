import React from 'react';
import { useStateValue } from '../Context';
import { PageHeader } from '../components/PageHeader';
import { Podium } from '../components/Podium';
import { Ranking } from '../components/Ranking';
import { EmptyRanking } from '../components/EmptyRanking';
import { Footer } from '../components/Footer';
import { Page } from '../styles/Page';
import { useLanguage } from '../i18n/LanguageContext';

const PODIUM_SIZE = 3;

// Page header, the top three as a podium, the rest in the table, the footer.
export const Home = ({ onRefresh }) => {
  const [state] = useStateValue();
  const { t } = useLanguage();
  const players = state.ranking;
  const rest = players.slice(PODIUM_SIZE);

  return (
    <Page>
      <PageHeader
        title={t('home.title')}
        intro={t('home.intro')}
        medalRanges
        onRefresh={onRefresh}
      />
      {players.length === 0 ? (
        <EmptyRanking />
      ) : (
        <>
          <Podium players={players.slice(0, PODIUM_SIZE)} />
          {rest.length > 0 && <Ranking players={rest} startRank={PODIUM_SIZE + 1} />}
        </>
      )}
      <Footer />
    </Page>
  );
};
