import styled from 'styled-components';
import { media } from './breakpoints';

// The page container. On phones it leaves room for the fixed bottom bar.
export const Main = styled.main`
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 100vh;
  padding-bottom: calc(var(--bottom-bar-height) + env(safe-area-inset-bottom));
  /* Until the pages are rebuilt (T3-T5), the old fixed-size tables can be wider
     than a phone: they scroll inside <main> instead of widening the page. */
  overflow-x: auto;
  outline: none;

  ${media.md} {
    padding-bottom: 0;
  }
`;
