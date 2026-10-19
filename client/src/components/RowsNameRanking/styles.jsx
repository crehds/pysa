import styled, { css } from 'styled-components';
import { media } from '../../styles/breakpoints';

// Columns that only show from the sm breakpoint; phones keep #, Player, MMR, KDA.
export const optionalColumn = css`
  display: none;

  ${media.sm} {
    display: table-cell;
  }
`;

export const HeadingRow = styled.tr`
  background-color: var(--color-surface-raised);
  border-bottom: 1px solid var(--color-border);
`;

export const Heading = styled.th`
  padding: var(--space-3) var(--space-2);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: var(--font-size-sm);
  font-weight: 700;
  text-align: ${({ $numeric }) => ($numeric ? 'right' : 'left')};
  white-space: nowrap;
  ${({ $optional }) => $optional && optionalColumn}

  &:first-child {
    padding-left: var(--space-3);
  }

  &:last-child {
    padding-right: var(--space-3);
  }
`;
