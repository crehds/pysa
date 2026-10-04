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
  outline: none;

  ${media.md} {
    padding-bottom: 0;
  }
`;
