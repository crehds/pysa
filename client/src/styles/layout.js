import { css } from 'styled-components';
import { media } from './breakpoints';

// Side padding shared by every section of a page, so the header, the podium,
// the table and the footer line up.
export const pageGutter = css`
  padding-inline: var(--space-4);

  ${media.md} {
    padding-inline: var(--space-6);
  }
`;
