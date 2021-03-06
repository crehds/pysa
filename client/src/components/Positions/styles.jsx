import styled from 'styled-components';

export const PositionsContainer = styled.div`
  display: grid;
  align-items: center;
`;

export const Position = styled.div`
  color: #b39999;
  font-family: 'Ubuntu';
  margin: 8px 0;
  &:nth-of-type(1) {
    color: gold;
    font-weight: bold;
  }
  &:nth-of-type(2) {
    color: silver;
    font-weight: bold;
  }
  &:nth-of-type(3) {
    color: #cd7f32;
    font-weight: bold;
  }
`;
