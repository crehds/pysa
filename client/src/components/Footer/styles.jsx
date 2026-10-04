import styled from 'styled-components';
import { pageGutter } from '../../styles/layout';

// Pushed to the bottom of <main> when the page is short.
export const FooterBar = styled.footer`
  ${pageGutter}
  margin-top: auto;
  text-align: left;
  padding-block: var(--space-6);
  border-top: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
`;

// A plain list of links: the page has a single navigation landmark, the menu.
export const LinkList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin-top: var(--space-2);
`;

export const FooterLink = styled.a`
  color: var(--color-text);
  text-decoration: underline;
  text-underline-offset: var(--space-1);

  &:hover {
    color: var(--color-gold);
  }
`;
