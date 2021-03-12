import styled from 'styled-components';

export const AdminPlayersCarousel = styled.div`
  display: grid;
  grid-template-columns: 1fr 3fr 1fr;
  grid-template-rows: auto 6fr;
  /* border: 1px solid red; */
  background-image: linear-gradient(180deg, rgb(48, 62, 83) 0%, rgba(34,40,49,.9) 100%);
  background-color: transparent;
  text-align: center;
  border-bottom: 3px solid rgb(23, 28, 36);
  border-top: 3px outset rgba(37, 49, 68, 0.815);
`;
