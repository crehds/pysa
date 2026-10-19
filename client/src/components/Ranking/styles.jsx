import styled from 'styled-components';
import { media } from '../../styles/breakpoints';
import { pageGutter } from '../../styles/layout';

// As wide as <main>; the table fills its content box.
export const RankingContainer = styled.div`
  ${pageGutter}
  width: 100%;
  min-width: 0;
  padding-bottom: var(--space-6);
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
