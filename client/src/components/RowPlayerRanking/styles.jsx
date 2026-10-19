import styled from 'styled-components';
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

export const Rank = styled.span`
  font-weight: 700;
`;
