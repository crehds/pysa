import styled from 'styled-components';

export const PlayerTotalsWrapper = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 5.2fr 3.9fr;
  grid-template-rows: 3fr 1fr;
  font-family: 'Ubuntu';
  font-size: 16px;
  position: relative;
  border: 1px solid rgb(190, 181, 181);
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
  & div:nth-of-type(1) {
    border: 1px solid rgb(190, 181, 181);
    display: flex;
    justify-content: center;
    align-items: center;
    color: rgba(218, 100, 100, 0.945);
  }
`;

export const Sub2Total = styled.div`
  display: grid;
`;

export const Sub2TotalColumns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
`;

export const TotalColumns = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  border: 1px solid rgb(190, 181, 181);
  padding: 1px;
  & p:nth-of-type(1) {
    color: rgba(172, 179, 185, 0.836);
  }
  & p:nth-of-type(2) {
    color: rgba(194, 132, 132, 0.945);
  }
`;

export const TotalDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid rgb(190, 181, 181);
  & p {
    font-size: 20px;
    color: rgba(113, 165, 214, 0.767);
  }
`;

export const MMRWrapper = styled.div`
  display: flex;
  grid-column: 1 / -1;
  justify-content: space-around;
  align-items: center;
  border: 1px solid rgb(190, 181, 181);
  & div:nth-of-type(1) {
    color: rgba(223, 206, 56, 0.79);
  }
  & div:nth-of-type(2) {
    color: rgba(172, 179, 185, 0.836);
  }
  & div:nth-of-type(3) {
    color: rgba(194, 132, 132, 0.945);
  }
`;

export const ButtonsWrapper = styled.div`
  position: absolute;
  right: 40%;
  bottom: -40px;
  
  & button {
    cursor: pointer;
    /* border: 1px solid gray; */
    border-radius: 5px;
    font-family: 'Reggae One';
    background-color: lightcyan;
    padding: 5px 15px;
    margin-right: 10px;
    &:nth-of-type(1) {
      /* background-image: radial-gradient(
        circle farthest-corner at 10% 20%,
        rgba(0, 84, 166, 1) 0%,
        rgba(132, 189, 201, 1) 90%
      ); */
      background-image: radial-gradient( circle farthest-corner at 10% 20%,  rgba(0,107,141,1) 0%, rgba(0,69,91,1) 90% );
    }
    &:nth-of-type(2) {
      background-image: radial-gradient(
        circle farthest-corner at 50.3% 44.5%,
        rgba(116, 147, 179, 1) 0%,
        rgba(62, 83, 104, 1) 100.2%
      );
    }
    &:active {
      /* box-shadow: 0 2px #666; */
      transform: translateY(4px);
    }
  }
`;
