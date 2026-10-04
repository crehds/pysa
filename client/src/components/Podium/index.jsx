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

// Names the metal in text, so the gold/silver/bronze fill is never the only cue.
const METAL_LABELS = ['oro', 'plata', 'bronce'];

// The top three, as an ordered list. `players` is already sorted and holds at
// most three; fewer than three are shown as they are.
export const Podium = ({ players }) => (
  <PodiumSection>
    <PodiumList aria-label='Podio' $count={players.length}>
      {players.map((player, i) => {
        const rank = i + 1;
        return (
          <Card key={player._id ?? i} $rank={rank}>
            <Badge $rank={rank}>
              {rank}
              <VisuallyHidden>, {METAL_LABELS[i]}</VisuallyHidden>
            </Badge>
            <Name>{player.nickname}</Name>
            <Medal>{player.medail}</Medal>
            <Mmr>
              <MmrLabel>MMR</MmrLabel> <MmrValue>{player.mmr}</MmrValue>
            </Mmr>
          </Card>
        );
      })}
    </PodiumList>
  </PodiumSection>
);
