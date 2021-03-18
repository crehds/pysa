import styled from 'styled-components';

export const AdminPlayersCarousel = styled.div`
  display: grid;
  grid-template-columns: 1fr 3fr 1fr;
  grid-template-rows: auto 6fr;
  /* border: 1px solid red; */
  background-image: linear-gradient(
    180deg,
    rgb(48, 62, 83) 0%,
    rgba(34, 40, 49, 0.9) 100%
  );
  background-color: transparent;
  text-align: center;
  border-bottom: 3px solid rgb(23, 28, 36);
  border-top: 3px outset rgba(37, 49, 68, 0.815);
  position: relative;
`;

export const IconUserOverlay = styled.div`
  width: 100%;
  position: absolute;
  /* right: 0; */
  top: -40px;
  /* border: 1px solid red; */
  /* display:flex;
  justify-content:center;
  align-items:center; */
`;

export const IconUserWrapper = styled.div`
  /* max-width: 100%; */
  display: flex;
  justify-content: center;
  align-items: center;
  & svg {
    font-size: 35px;
    cursor: pointer;
    /* border: 1px solid red; */
    color: rgba(211, 211, 211, 0.6);
    padding: 0px 3px;
    &:hover {
      fill: rgba(185, 164, 41, 0.836);
    }
  }
`;
