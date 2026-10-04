import styled, { css } from 'styled-components';
import { optionalColumn } from '../RowsNameRanking/styles';

// Zebra rows plus a hairline between them, all from the tokens.
export const Row = styled.tr`
  border-bottom: 1px solid var(--color-border);

  &:nth-child(even) {
    background-color: var(--color-surface);
  }
`;

export const Cell = styled.td`
  padding: var(--space-3) var(--space-2);
  color: var(--color-text-muted);
  font-family: var(--font-body);
  text-align: ${({ $numeric }) => ($numeric ? 'right' : 'left')};
  ${({ $optional }) => $optional && optionalColumn}

  &:first-child {
    padding-left: var(--space-3);
  }

  &:last-child {
    padding-right: var(--space-3);
  }
`;

export const NameCell = styled(Cell)`
  color: var(--color-text);
  font-weight: 500;
  overflow-wrap: anywhere;
`;

const podiumColors = {
  1: 'var(--color-gold)',
  2: 'var(--color-silver)',
  3: 'var(--color-bronze)',
};

// Ranks 1-3 get a filled round badge (a shape cue, with dark text on the
// metal color); the others are plain numbers.
export const Rank = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--space-6);
  height: var(--space-6);
  border-radius: var(--radius-full);
  font-weight: 700;
  ${({ $rank }) =>
    podiumColors[$rank] &&
    css`
      background-color: ${podiumColors[$rank]};
      color: var(--color-bg);
    `}
`;

export const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
`;
