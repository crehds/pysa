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
import { entranceFor, glowFor } from '../../styles/podiumMotion';
import { useMotionLevel } from '../../motion/MotionContext';
import { useLanguage } from '../../i18n/LanguageContext';

// The top three, as an ordered list. `players` is already sorted and holds at
// most three; fewer than three are shown as they are. On mount the cards come
// in by motion level (see podiumMotion).
export const Podium = ({ players }) => {
  const { t, medal } = useLanguage();
  const level = useMotionLevel();
  return (
    <PodiumSection>
      <PodiumList aria-label={t('podium.label')} $count={players.length}>
        {players.map((player, i) => {
          const rank = i + 1;
          const entrance = entranceFor(level, rank, players.length);
          // The glow pulses once its card is in.
          const glow = glowFor(level, entrance ? entrance.delayMs + entrance.durationMs : 0);
          return (
            <Card key={player._id ?? i} $rank={rank} $entrance={entrance} $glow={glow}>
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
