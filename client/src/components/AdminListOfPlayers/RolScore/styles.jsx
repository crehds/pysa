import styled from 'styled-components';

export const RolScoreWrapper = styled.div`
  display: grid;
  border: 1px solid lightgray;
  grid-template-columns: 1.5fr repeat(7, 1.3fr);
  grid-column-gap: 10px;
  & div {
    text-align: center;
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    grid-column-gap: 5px;
    align-items: center;
    font-family: 'Ubuntu';
    border-left: 1px solid lightgray;
    border-right: 1px solid lightgray;
    font-size: 15px;
    @media (max-width: 1500px) {
      font-size: 12.5px;
    }
    & p:nth-of-type(1) {
      color: rgba(172, 179, 185, 0.836);
    }
    & p:nth-of-type(2) {
      color: rgba(194, 132, 132, 0.945);
    }
    &:nth-of-type(1) {
      display: flex;
      justify-content: center;
      align-items: center;
      color: rgba(255, 255, 255, 0.726);
      font-size: 15px;
    }
    /* margin: auto 0; */
    & input {
      text-align: center;
      width: 100%;
      color: rgba(8, 7, 7, 0.963);
      border-radius: 2px;
      border: none;
      &:focus {
        outline: none;
        border: 1px solid rgba(5, 93, 161, 0.742);
        
      }
    }
  }
`;
