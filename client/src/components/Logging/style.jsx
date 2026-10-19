import styled from 'styled-components';
import { media } from '../../styles/breakpoints';
import { navItem } from '../NavBar/styles';

// The login/logout control is a real button that looks like the other
// navigation items. On the rail it sits at the bottom, below the links.
export const AuthButton = styled.button`
  ${navItem}

  ${media.md} {
    margin-top: auto;
  }
`;
