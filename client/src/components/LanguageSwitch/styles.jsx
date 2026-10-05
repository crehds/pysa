import styled from 'styled-components';
import { media } from '../../styles/breakpoints';

// Two small buttons inside the navigation. On the phone bar they stack in a
// narrow column at the end, so the five admin items still fit; on the rail they
// sit side by side above "Ocultar menú".
export const SwitchGroup = styled.div`
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  width: var(--space-12);
  border-left: 1px solid color-mix(in srgb, var(--color-text) 30%, transparent);

  ${media.md} {
    flex-direction: row;
    width: 100%;
    margin-top: var(--space-2);
    padding: 0 var(--space-3);
    border-left: 0;
    gap: var(--space-1);
  }
`;

// The chosen language is marked by bolder, underlined text and a tint, so color
// is never the only signal; aria-pressed says the same to assistive tech.
export const SwitchButton = styled.button`
  flex: 1 1 0;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: var(--font-size-xs);
  font-weight: 400;
  line-height: 1;
  cursor: pointer;

  &:hover {
    background-color: color-mix(in srgb, var(--color-text) 14%, transparent);
  }

  &[aria-pressed='true'] {
    background-color: color-mix(in srgb, var(--color-text) 14%, transparent);
    font-weight: 700;
    text-decoration: underline;
    text-decoration-thickness: var(--space-1);
    text-underline-offset: var(--space-1);
    text-decoration-color: var(--color-focus);
  }

  &:focus-visible {
    outline-offset: calc(-1 * var(--focus-ring-width));
  }

  ${media.md} {
    min-height: var(--space-8);
    border-radius: var(--radius-sm);
  }
`;
