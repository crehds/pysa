import styled from 'styled-components';

export const ScoreWrapper = styled.div`
  display: grid;
  grid-template-rows: 1fr 4.5fr 2fr;
`;

export const NamesScoreWrapper = styled.div`
  display: grid;
  grid-template-columns: 1.5fr repeat(7, 1.3fr);
  grid-column-gap: 10px;
  font-family: 'Source Sans Pro';
  font-weight: 600;
  border: 1px solid lightgray;
  /* font-size: 17px; */
  & .nameScoreColumn:nth-of-type(1) {
    /* margin: auto; */
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    /* position: relative; */
    /* color: rgb(10, 13, 19); */
    & .wrapperScoreRol {
      position: relative;
    }
  }
  & .nameScoreColumn {
    /* margin: auto; */
    /* text-align: center; */
    color: rgba(185, 164, 41, 0.836);
    border-left: 1px solid lightgray;
    border-right: 1px solid lightgray;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    & .scoreColumn__div {
      display: grid;
      grid-template-columns: 1fr 2fr 1fr;
      grid-column-gap: 5px;
      & p:nth-of-type(1) {
        color: rgba(172, 179, 185, 0.836);
      }
      & p:nth-of-type(2) {
        color: rgba(8, 7, 7, 0.963);
      }
      & p:nth-of-type(3) {
        color: rgba(194, 132, 132, 0.945);
      }
    }
  }
`;

export const Icon = styled.div`
  position: absolute;
  top: 1px;
  right: -30px;
  font-size: 25px;
  color: rgba(255, 255, 255, 0.815);
  &:hover {
    & svg {
      fill: rgba(185, 164, 41, 0.836);
    }
  }
`;
