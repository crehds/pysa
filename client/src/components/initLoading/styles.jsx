import styled from 'styled-components';

// A full-width screen with its content centered. It spans every column of the
// .App grid (on wide screens the grid has a rail column) and fills the height.
export const Screen = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-6);
  min-height: 100vh;
  padding: var(--space-6) var(--space-4);
  background-color: var(--color-bg);
  color: var(--color-text);
`;

// The logo scales down to fit a phone and stops growing on wide screens.
export const Img = styled.img`
  display: block;
  width: min(100%, calc(var(--space-16) * 5));
  height: auto;
`;
