import styled from 'styled-components';

export const ToFocusWrapper = styled.div`
  position: relative;
  &:nth-of-type(2) {
    grid-column: 1 / 2;
    grid-row: 2 / 3;
  }
  &:nth-of-type(4) {
    grid-column: 3 / 4;
    grid-row: 2 / 3;
  }
`;

export const Arrow = styled.div`
  font-size: 60px;
  position: absolute;
  top: 40%;
  padding: 5px;
  &.left {
    left: 35%;
  }
  &.right {
    right: 35%;
  }
`;
