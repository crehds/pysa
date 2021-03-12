import styled, { keyframes } from 'styled-components';

const Eclipse = keyframes`
  to {
    background-position: top left;
  }
`;

const Shadow = keyframes`
  from {
    box-shadow: -20px -20px 30px -10px rgba(25, 40, 36, 1);
  }
  to {
    box-shadow: 20px 20px 30px -10px rgba(25, 40, 36, 1);
  }
`
export const Div = styled.div`
  position: relative;
  min-height: 100vh;
  min-width: 100vw;
  display:flex;
  justify-content: center;
  align-items: center;
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
  position: absolute;
`;

export const Img = styled.img`
  width: 480px;
  height: 480px;
`;

export const ImgWrapper = styled.div`
  color: red;
  z-index: 5000;
  animation: ${Shadow} 2s alternate infinite;
  box-shadow: 0px 0px 30px -10px rgb(25, 40, 36);
`;
