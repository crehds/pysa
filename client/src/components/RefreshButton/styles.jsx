import styled, { css } from 'styled-components';

// The look shared by the buttons in the page header ("Actualizar", the medal
// ranges toggle).
export const actionButton = css`
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
`;

// Pages without a page header yet float it at the top right of <main>.
export const Button = styled.button`
  ${actionButton}

  ${({ $floating }) =>
    $floating &&
    css`
      position: absolute;
      top: var(--space-4);
      right: var(--space-4);
      z-index: 1;
    `}
`;
