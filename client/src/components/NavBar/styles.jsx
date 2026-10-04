import styled, { css } from 'styled-components';
import { Link as LinkRouter, NavLink } from 'react-router';
import { media } from '../../styles/breakpoints';

// Shared by every control in the navigation (links and the login button): an
// icon over a label. The active page is marked by a gold bar plus bolder text,
// so color is never the only signal; the matching aria-current="page" comes
// from NavLink.
export const navItem = css`
  display: flex;
  flex: 1 1 0;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  min-height: var(--space-12);
  padding: var(--space-2) var(--space-1);
  border: 0;
  border-top: var(--space-1) solid transparent;
  border-radius: 0;
  background: transparent;
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: var(--font-size-xs);
  font-weight: 500;
  line-height: 1.2;
  text-align: center;
  text-decoration: none;
  cursor: pointer;

  & svg {
    font-size: var(--font-size-2xl);
    flex-shrink: 0;
  }

  &:hover {
    background-color: color-mix(in srgb, var(--color-text) 14%, transparent);
  }

  &[aria-current='page'] {
    border-top-color: var(--color-focus);
    font-weight: 700;
    background-color: color-mix(in srgb, var(--color-text) 14%, transparent);
  }

  ${media.md} {
    flex: 0 0 auto;
    width: 100%;
    padding: var(--space-3) var(--space-1);
    border-top: 0;
    border-left: var(--space-1) solid transparent;

    &[aria-current='page'] {
      border-left-color: var(--color-focus);
    }
  }
`;

// A semantic <nav> (rather than a plain <div>) gives this container an
// implicit role="navigation" landmark, which is both correct accessibility
// markup and the stable handle e2e/tests/players-navigation.spec.js uses to
// scope its click to the navbar instead of matching a link anywhere on the
// page. It is the only navigation on the page: a fixed bottom bar below the
// md breakpoint and a sticky left rail from it up.
export const NavBarContainer = styled.nav`
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  display: flex;
  height: calc(var(--bottom-bar-height) + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  background-color: var(--color-rail);
  color: var(--color-text);

  ${media.md} {
    position: sticky;
    top: 0;
    right: auto;
    bottom: auto;
    left: auto;
    align-self: start;
    flex-direction: column;
    width: var(--rail-width);
    height: 100vh;
    padding: var(--space-4) 0;
    overflow-y: auto;
  }
`;

// The logo only shows on the rail; on phones the "Ranking" link is the way home.
export const LogoLink = styled(LinkRouter)`
  display: none;

  ${media.md} {
    display: block;
    margin-bottom: var(--space-4);
    padding: 0 var(--space-3);

    & img {
      display: block;
      width: 100%;
      height: auto;
    }
  }
`;

export const Item = styled(NavLink)`
  ${navItem}
`;

export const ExternalItem = styled.a`
  ${navItem}
`;
