import styled, { css, keyframes } from 'styled-components';

const LeftMovement = keyframes`
  from {
    left: 36%;
  }
  to {
    left: 33%;
  }
`;
const RightMovement = keyframes`
  from {
    right: 36%;
  }
  to {
    right: 33%;
  }
`;

const ArrowMovement = ({ direction, type = 'ease' } = {}) => css`
  animation: 1s ${direction} ease infinite;
`;

export const ToFocusWrapper = styled.div`
  position: relative;
  /* background: rgba(87, 47, 47, 0.447); */
  &:nth-of-type(3) {
    grid-column: 1 / 2;
    grid-row: 2 / 3;
  }
  &:nth-of-type(5) {
    grid-column: 3 / 4;
    grid-row: 2 / 3;
  }
  &:hover {
    & > div.left {
      left: 35% !important;
      background-image: radial-gradient(
        circle 911px at 0.4% 50.5%,
        rgba(199, 80, 76, 0.951) 18.7%,
        rgba(21, 30, 33, 1) 90%
      );
    }
    & > div.right {
      right: 35% !important;
      background-image: radial-gradient(
        circle 911px at 0.4% 50.5%,
        rgba(199, 80, 76, 0.951) 18.7%,
        rgba(21, 30, 33, 1) 90%
      );
    }
    & > div h2 {
      color: rgba(204, 187, 33, 0.884);
      transform: scale(1.3);
    }
  }
  & div h2 {
    color: rgba(249, 224, 174, 0.519);
  }
`;

export const Arrow = styled.div`
  font-size: 60px;
  position: absolute;
  top: 40%;
  padding: 5px;
  background-image: radial-gradient(
    circle 911px at 0.4% 50.5%,
    rgba(199, 80, 76, 0.551) 18.7%,
    rgba(21, 30, 33, 1) 90%
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  &.left {
    /* left: 35%; */
    transition: 2s;
    ${() => css`
      ${ArrowMovement({
        direction: LeftMovement,
        type: 'cubic-bezier(0.57, 0.07, 0.44, 2)',
      })}
    `}
  }
  &.right {
    /* right: 35%; */
    ${() => css`
      ${ArrowMovement({
        direction: RightMovement,
        type: 'cubic-bezier(0.57, 0.07, 0.44, 2)',
      })}
    `}
  }
`;
