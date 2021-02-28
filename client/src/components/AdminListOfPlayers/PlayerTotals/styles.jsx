import styled from 'styled-components';

export const PlayerTotalsWrapper = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 4fr 3fr;
  grid-template-rows: 3fr 1fr;
  /* & div {
    
  } */
`;

export const SubTotal = styled.div`
  display: grid;
  grid-template-rows: 2fr 1fr;
  grid-template-columns: 1fr 1fr;
`;

export const SubTotalKDA = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  & div:nth-of-type(1) {
    margin: 0;
  }
`;

export const KDA = styled.div`
  grid-column: 1/-1;
  display: grid;
  grid-template-columns: 1fr 2fr;
`;

export const Sub2Total = styled.div` 
`;

export const Sub2TotalColumns = styled.div`
  display:grid;
  grid-template-columns: 1fr 1fr;
`

export const TotalColumns = styled.div`
  display: flex;
  justify-content: space-around;
  border:1px solid black;
  /* &:nth-of-type(1) {
    margin:auto 0;
  } */
`;

export const TotalDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items:center;
  border: 1px solid black;
`

export const ImagesWrapper = styled.div`
  display: flex;
  grid-column: 1 / -1;
  justify-content: space-around;
`;
