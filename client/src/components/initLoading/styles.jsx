import styled, { keyframes } from 'styled-components';

const Eclipse = keyframes`
  to {
    background-position: top left;
  }
`;

export const Div = styled.div`
  position: relative;
`;

export const Overlay = styled.div`
  min-height: 100vh;
  min-width: 100vw;
  animation: ${Eclipse} 2s alternate infinite;
  /* background:radial-gradient(farthest-corner at center, #FFFFFF 0%, #dd1818  8%, #333333 24.5%, #dd1818  62.5%, #333333 100%) */
  background: radial-gradient(
      farthest-corner at top,
      #ffffff 0%,
      #dd1818 4%,
      #7a1313 12.25%,
      #5a0d0d 31.25%,
      #333333 50%
    )
    top right/200% 200%;
`;

export const Img = styled.img`
  width: 480px;
  height: 480px;
`;

export const ImgWrapper = styled.div`
  /* border: 1px solid red; */
  color: red;
  position: absolute;
  top: 15%;
  right: 30%;
`;
