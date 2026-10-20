import styled, { css, keyframes } from 'styled-components';

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

// The fast loader's logo: small, with a short pulse that only says "loading".
// It stays still when the visitor wants no motion.
const pulse = keyframes`
  from { opacity: 0.55; transform: scale(0.94); }
  to { opacity: 1; transform: scale(1); }
`;

export const LoaderLogo = styled.img`
  display: block;
  width: calc(var(--space-16) * 1.25);
  height: auto;
  ${({ $pulse }) =>
    $pulse &&
    css`
      animation: ${pulse} 0.9s ease-in-out infinite alternate;
    `}
`;
