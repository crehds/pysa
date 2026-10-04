import styled from 'styled-components';
import { media } from '../../styles/breakpoints';

// Relative box for the medal ranges popup. It is as wide as <main>; the extra
// top room keeps the table clear of the refresh and show-menu buttons that sit
// at the top of <main> until the page header (T4) takes them in.
export const RankingContainer = styled.div`
  position: relative;
  align-self: flex-start;
  width: 100%;
  min-width: 0;
  padding: var(--space-16) var(--space-4) var(--space-6);

  ${media.md} {
    padding-inline: var(--space-6);
  }
`;

export const RankingTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
  font-variant-numeric: tabular-nums;

  ${media.sm} {
    font-size: var(--font-size-base);
  }
`;

export const Info = styled.span`
  display: inline-flex;
  vertical-align: middle;
  margin-left: var(--space-2);
  color: var(--color-text-muted);
  font-size: var(--font-size-lg);
  cursor: help;

  &:hover {
    color: var(--color-text);
  }
`;
