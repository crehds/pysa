import styled from 'styled-components';

export const InfoWrapper = styled.div`
  border: 1px solid transparent;
  position: absolute;
  top: -150%;
  left: 250%;
  z-index: 400;
  font-size: 16px;
  background-color: rgba(16, 93, 182, 0.92);
  border-radius: 5px;
  font-family: 'Source Sans Pro';
  font-weight: 600;
  display:none;
`;

export const InfoDetail = styled.div`
  display: grid;
  grid-template-columns: 0.2fr 1fr;
  align-items: center;
  column-gap:5px;
  padding: 3px;
  & p {
    padding: 1px 3px;
  }
  &:nth-of-type(1) {
    & p {
      color: rgba(172, 179, 185, 0.836);
    }
  }
  &:nth-of-type(2) {
    & p {
      color: rgba(8, 7, 7, 0.963);
    }
  }
  &:nth-of-type(3) {
    & p {
      color: rgba(194, 132, 132, 0.945);
    }
  }
`;
