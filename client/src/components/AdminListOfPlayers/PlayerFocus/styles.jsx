import styled from 'styled-components';

export const FocusWrapper = styled.div`
  grid-column: 2 / 3;
  grid-row: 2 / 3;
  display: grid;
  grid-template-rows: 3fr 5fr;
  font-size: 15px;
`;

export const ImageWrapper = styled.div`
  max-width: 40%;
  margin: 0 auto;
  & img {
    width: 50%;
  }
`;

export const NameWrapper = styled.div`
  & p {
    font-size: 20px;
    padding: 5px 0;
    font-weight: bold;
  }
`

export const NamesScoreWrapper = styled.div`
  display: grid;
  grid-template-columns: 1.5fr repeat(7, 1.3fr);
  grid-column-gap: 10px;
  font-family: 'Source Sans Pro';
  /* font-size: 17px; */
  & div:nth-of-type(1) {
    margin: auto;
    &.rolTitle {
      font-size: 20px;
    }
    
  }
  & div {
    /* margin: auto; */
    text-align:center;
  }
  & div div {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-column-gap: 5px;
  }
`

