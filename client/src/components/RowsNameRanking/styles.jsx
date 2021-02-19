import styled from 'styled-components';

export const RowsNames = styled.div`
  /* border: 1px solid gray; */
  border: groove #A1A1A1 5px;
  border-bottom: none;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  align-items: center;
  grid-column: 1 / 3;
`

export const RowName = styled.div`
  border: 3px outset rgb(161, 149, 42);
  background: rgba(177, 163, 35, 0.603);
`

export const Name = styled.h3`
  color: rgba(94, 65, 70, 0.973);
  font-size: 28px;
  font-family: 'Reggae One', system-ui;
  font-weight: 600;
  padding: 0 5px;
`