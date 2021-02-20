import styled from 'styled-components';

export const MedailsDiv = styled.div`
  position: absolute;
  right: 45px;
  top: 50%;
  /* border: 1px solid blue; */
  display: none;
  background-color: rgba(151, 140, 140, 0.897);
  padding: 8px;
  display: grid;
  grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
`;

export const GridDiv = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-column-gap: 12px;
  color: lightgray;
  font-family: 'Oswald';
`