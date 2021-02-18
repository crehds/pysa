import styled from 'styled-components';
import { GrTrophy } from 'react-icons/gr';
export const RankingTable = styled.div`
  /* border: 1px solid red; */
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-columns: 1fr 4fr;
  /* margin: 1em; */
  padding: 50px;
`

export const RowsNames = styled.div`
  /* border: 1px solid gray; */
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  align-items: center;
  grid-column: 1 / 3;
`

export const RowName = styled.div`
  border: 1px solid black;
`

export const Name = styled.h3`
  color: #be3144;
  font-size: 27px;
  font-family: 'Source Sans Pro', system-ui;
  font-weight: 600;
`