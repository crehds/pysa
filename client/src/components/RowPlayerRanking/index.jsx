import React from 'react';
import { Cell, NameCell, Rank, Row } from './styles';
import { VisuallyHidden } from '../../styles/VisuallyHidden';

// Text for the top three, so the gold/silver/bronze mark is never the only cue.
const PODIUM_LABELS = ['oro', 'plata', 'bronce'];

export const RowPlayerRanking = ({ rank, name, partidas, mmr, kda, medail }) => {
  const podiumLabel = PODIUM_LABELS[rank - 1];

  return (
    <Row>
      <Cell>
        <Rank $rank={rank}>
          {rank}
          {podiumLabel && <VisuallyHidden>, {podiumLabel}</VisuallyHidden>}
        </Rank>
      </Cell>
      <NameCell>{name}</NameCell>
      <Cell $numeric $optional>
        {partidas}
      </Cell>
      <Cell $numeric>{mmr}</Cell>
      <Cell $numeric>{kda}</Cell>
      <Cell $optional>{medail}</Cell>
    </Row>
  );
};
