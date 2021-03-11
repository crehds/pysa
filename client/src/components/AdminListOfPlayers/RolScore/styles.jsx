import styled from 'styled-components'

export const RolScoreWrapper = styled.div`
  display: grid;
  border: 1px solid gray;
  grid-template-columns: 1.5fr repeat(7, 1.3fr);
  grid-column-gap: 10px;
  & div {
    text-align: center;
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    grid-column-gap: 5px;
    align-items: center;
    font-family: 'Ubuntu';
    &:nth-of-type(1) {
      display:flex;
      margin: auto;
    }
    /* margin: auto 0; */
    & input {
      text-align:center;
      width: 100%;
    }
  }
`
