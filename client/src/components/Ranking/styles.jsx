import styled from 'styled-components';

export const RankingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: inherit;
  width: 100%;
`

export const RankingTable = styled.div`
  /* border: 1px solid red; */
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-columns: 1fr 4fr;
  /* margin: 1em; */
  padding: 50px;
  text-align: center;
  margin: 10px;
  box-shadow: 0 0 10px 5px rgba(0, 0, 0, 0.09);
  /* position: absolute;
  top: 10%;
  right: 6%; */
  position: relative;
`;

export const Info = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  & svg {
    color: gray;
    &:hover {
      /* border: 1px solid red; */
      color: white;
      fill: white;
    }
  }
`;
