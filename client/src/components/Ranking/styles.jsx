import styled, { css } from 'styled-components';

export const RankingTable = styled.div`
  /* border: 1px solid red; */
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-columns: 1fr 5fr;
  /* margin: 1em; */
  padding: 35px 40px;
  text-align: center;
  ${({ size }) => css`
    width: ${size - 100}px;
    height: ${size / 1.95 - 100}px;
  `}
  margin: 10px;
  box-shadow: 0 0 10px 5px rgba(0, 0, 0, 0.09);
  /* position: absolute;
  top: 10%;
  right: 6%; */
  position: relative;
  /* width: 100%;
  height: 100%; */
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
