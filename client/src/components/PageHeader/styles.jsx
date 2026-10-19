import styled from 'styled-components';
import { media } from '../../styles/breakpoints';
import { pageGutter } from '../../styles/layout';
import { actionButton } from '../RefreshButton/styles';

// Phones: the logo and the buttons on one row, the title block below. From md
// up the rail carries the logo, so the title and the buttons share the row.
export const Header = styled.header`
  ${pageGutter}
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas:
    'logo actions'
    'title title';
  align-items: center;
  gap: var(--space-3);
  text-align: left;
  padding-top: var(--space-4);
  padding-bottom: var(--space-6);

  ${media.md} {
    grid-template-areas: 'title actions';
    align-items: start;
    padding-top: var(--space-6);

    /* "Mostrar menú" is fixed at the top left while the menu is hidden: keep
       the title below it. */
    [data-menu-hidden='true'] & {
      padding-top: var(--space-16);
    }
  }
`;

export const Logo = styled.img`
  grid-area: logo;
  display: block;
  width: var(--space-12);
  height: var(--space-12);

  ${media.md} {
    display: none;
  }
`;

export const TitleBlock = styled.div`
  grid-area: title;
  min-width: 0;
`;

export const Title = styled.h1`
  font-size: var(--font-size-3xl);
  line-height: 1.2;

  ${media.md} {
    font-size: var(--font-size-4xl);
  }
`;

export const Intro = styled.p`
  margin-top: var(--space-2);
  max-width: calc(var(--space-16) * 10);
  color: var(--color-text-muted);
`;

export const Actions = styled.div`
  grid-area: actions;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--space-2);
`;

export const MedalRangesButton = styled.button`
  ${actionButton}
`;
