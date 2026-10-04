import styled from 'styled-components';

// Medal ranges popup. Ranking toggles its inline `display` on hover of the info
// icon, so it starts as `none` here.
export const MedailsDiv = styled.div`
  position: absolute;
  right: var(--space-6);
  top: var(--space-16);
  z-index: 1;
  display: none;
  background-color: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  padding: var(--space-2);
  grid-template-rows: repeat(9, auto);
`;

export const GridDiv = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-column-gap: var(--space-3);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: var(--font-size-sm);
`;
