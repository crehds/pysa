import styled from 'styled-components';

export const NavBarContainer = styled.div`
  height: 100vh;
  /* border: 1px solid blue; */
  width: 60px;
  display: grid;
  grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr;
  top: 0;
  left: 0;
  background-image: linear-gradient(
    89.8deg,
    rgba(160, 49, 49, 0.87) 4.7%,
    rgba(30, 29, 29, .9) 120.3%
  );
  border-right: 3px solid rgba(30, 29, 29, .85);
`;

export const ImgWrapper = styled.div`
margin: auto 0;
  & img {
    max-width: 100%;
  }
`;

export const Icon = styled.div`
  /* font-size: 25px; */
  display: flex;
  justify-content: center;
  align-items: center;
  & svg {
    color: rgba(211, 211, 211, 0.6);
    font-size: 30px;
  }
`;
