import styled from 'styled-components';
import { mediaBelow } from '../../styles/breakpoints';

// Top left of the screen, mirroring "Actualizar" at the top right. Only on
// wide screens: below md the bottom bar always shows.
export const Button = styled.button`
  position: fixed;
  top: var(--space-4);
  left: var(--space-4);
  z-index: 10;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background-color: var(--color-surface-raised);
  }

  & svg {
    font-size: var(--font-size-xl);
  }

  ${mediaBelow.md} {
    display: none;
  }
`;
