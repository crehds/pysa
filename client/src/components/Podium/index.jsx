import React from 'react';
import {
  Badge,
  Card,
  Medal,
  Mmr,
  MmrLabel,
  MmrValue,
  Name,
  PodiumList,
  PodiumSection,
} from './styles';
import { VisuallyHidden } from '../../styles/VisuallyHidden';
import { metalKeys } from '../../styles/podium';
import { useLanguage } from '../../i18n/LanguageContext';

// The top three, as an ordered list. `players` is already sorted and holds at
// most three; fewer than three are shown as they are.
export const Podium = ({ players }) => {
  const { t, medal } = useLanguage();
  return (
    <PodiumSection>
      <PodiumList aria-label={t('podium.label')} $count={players.length}>
        {players.map((player, i) => {
          const rank = i + 1;
          return (
            <Card key={player._id ?? i} $rank={rank}>
              <Badge $rank={rank}>
                {rank}
                <VisuallyHidden>, {t(metalKeys[i])}</VisuallyHidden>
              </Badge>
              <Name>{player.nickname}</Name>
              <Medal>{medal(player.medail)}</Medal>
              <Mmr>
                <MmrLabel>MMR</MmrLabel> <MmrValue>{player.mmr}</MmrValue>
              </Mmr>
            </Card>
          );
        })}
      </PodiumList>
    </PodiumSection>
  );
};
