import React from 'react';
import styled from 'styled-components';
import { useStateValue } from '../Context';
import { PageHeader } from '../components/PageHeader';
import { Podium } from '../components/Podium';
import { Ranking } from '../components/Ranking';
import { EmptyRanking } from '../components/EmptyRanking';
import { Footer } from '../components/Footer';

const PODIUM_SIZE = 3;

const Page = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  min-width: 0;
`;

// Page header, the top three as a podium, the rest in the table, the footer.
export const Home = ({ onRefresh }) => {
  const [state] = useStateValue();
  const players = state.ranking;
  const rest = players.slice(PODIUM_SIZE);

  return (
    <Page>
      <PageHeader onRefresh={onRefresh} />
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
