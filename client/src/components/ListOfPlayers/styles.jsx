import styled, { css } from 'styled-components';

export const PlayersCarousel = styled.div`
  border: 1px solid red;
  /* display:flex; */
  /* flex-wrap: nowrap; */
  /* max-width: calc(100vw - 100px); */
  ${({ size }) =>
    css`
      max-width: ${size};
    `}
  overflow-x: scroll;
  white-space: nowrap;
`;
