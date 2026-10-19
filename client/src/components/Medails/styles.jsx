import styled from 'styled-components';
import { media } from '../../styles/breakpoints';

// Medal ranges disclosure. It sits in the page header's flow, under the buttons,
// so it never covers the button that opens it. Closed it has the `hidden`
// attribute.
export const MedailsDiv = styled.div`
  grid-column: 1 / -1;
  justify-self: stretch;
  background-color: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-2);
  grid-template-rows: repeat(9, auto);

  &:not([hidden]) {
    display: grid;
  }

  ${media.md} {
    justify-self: end;
    min-width: calc(var(--space-16) * 4);
  }
`;

export const GridDiv = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-column-gap: var(--space-3);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: var(--font-size-sm);
`;
