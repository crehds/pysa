import styled from 'styled-components';
import { media } from '../../styles/breakpoints';
import { pageGutter } from '../../styles/layout';
import { siblingsRecedeCss } from '../../styles/cardSpotlight';

// One column on phones, two from sm, three from lg. `minmax(0, 1fr)` lets the
// cards shrink instead of widening the page.
export const PlayersGrid = styled.ul`
  ${pageGutter}
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-4);
  margin: 0;
  padding-top: 0;
  padding-bottom: var(--space-8);
  list-style: none;
  ${siblingsRecedeCss}

  ${media.sm} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${media.lg} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;
