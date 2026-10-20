import React from 'react';
import { Player } from '../Player';
import { EmptyRanking } from '../EmptyRanking';
import { PlayersGrid } from './styles';
import { useLanguage } from '../../i18n/LanguageContext';
import { useMotionLevel } from '../../motion/MotionContext';

// `players` is already sorted by ranking, so the rank is the position.
export const ListOfPlayers = ({ players }) => {
  const { t } = useLanguage();
  const lift = useMotionLevel() !== 'none';
  return players.length === 0 ? (
    <EmptyRanking />
  ) : (
    <PlayersGrid role='list' $lift={lift} aria-label={t('players.list')}>
      {players.map((player, i) => (
        <li key={player._id ?? i}>
          <Player {...player} rank={i + 1} />
        </li>
      ))}
    </PlayersGrid>
  );
};
