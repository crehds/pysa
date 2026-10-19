import React from 'react';
import { RankingContainer, RankingTable } from './styles';
import { PlayersInRanking } from '../PlayersInRanking';
import { RowsNameRanking } from '../RowsNameRanking';
import { useLanguage } from '../../i18n/LanguageContext';

// The table for the players after the podium. `startRank` is the rank of the
// first one, so the numbers stay the real positions.
export const Ranking = ({ players, startRank }) => {
  const { t } = useLanguage();
  return (
    <RankingContainer>
      <RankingTable aria-label={t('ranking.label')}>
        <RowsNameRanking />
        <PlayersInRanking players={players} startRank={startRank} />
      </RankingTable>
    </RankingContainer>
  );
};
