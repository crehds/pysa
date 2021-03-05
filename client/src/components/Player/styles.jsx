import styled, { css, keyframes } from 'styled-components';

export const boxShadow = (color) => keyframes`
  0% {
    box-shadow: 0 0 1px 1px ${color};
  }
  25% {
    box-shadow: 0 0 7px 7px ${color};
  }
  50% {
    box-shadow: 0 0 1px 1px ${color};
  }
  75% {
    box-shadow: 0 0 7px 7px ${color};
  }
  100% {
    box-shadow: 0 0 1px 1px ${color};
  }

`;

const boxShadowAnimated = ({
  time = '1s',
  type = 'cubic-bezier(0.5, 0.5, 0.76, 0.76)',
  color = 'gray',
} = {}) => css`
  animation: ${time} ${boxShadow(color)} ${type} infinite;
`;

export const Profile = styled.article`
  /* border: 1px solid blue; */
  width: 300px;
  margin: 5px 10px;
  height: 400px;
  display: inline-block;
  transition: 450ms all;
  transition: box-shadow 1s transform 450ms;
  transform-origin: center left;
  overflow: hidden;
  box-shadow: 0 0 5px 5px rgba(0, 0, 0, 0.3);
  &:last-of-type {
    /* border: 1px solid red; */
    transform-origin: center right;
  }
  &:hover ~ .profile {
    transform: translate3d(80px, 0, 0);
  }
  &:nth-of-type(1) {
    /* border: 1px solid gold; */
    ${() => css`
       {
        ${boxShadowAnimated({ time: '2s', color: 'gold' })}
      }
    `}
    /* box-shadow: 0 0 1px 1px gold; */
    & div div div {
      &.icon p {
        color: #eccc12;
      }
      &.playerName p {
        background-image: radial-gradient(
          circle farthest-corner at 12.3% 19.3%,
          #dbc752 0%,
          rgb(219, 189, 19) 100.2%
        );
      }
      & svg {
        color: gold;
      }
    }
    &:hover {
      box-shadow: 0 0 7px 7px gold;
    }
  }
  &:nth-of-type(2) {
    border: 1px solid silver;
    box-shadow: 0 0 5px 5px silver;
    ${() => css`
       {
        ${boxShadowAnimated({ time: '2s', color: 'silver' })}
      }
    `}
    & div div div {
      &.icon p {
        color: #aca9a9;
      }
      &.playerName p {
        background-image: radial-gradient(
          circle farthest-corner at 12.3% 19.3%,
          #d8d4d4 0%,
          #9c9999 100.2%
        );
      }
      & svg {
        color: silver;
      }
    }
    &:hover {
      box-shadow: 0 0 7px 7px silver;
    }
  }
  &:nth-of-type(3) {
    border: 1px solid #cd7f32;
    box-shadow: 0 0 5px 5px #cd7f32;
    ${() => css`
       {
        ${boxShadowAnimated({ time: '2s', color: '#cd7f32' })}
      }
    `}
    & div div div {
      &.icon p {
        color: #b6722e;
      }
      &.playerName p {
        background-image: radial-gradient(
          circle farthest-corner at 12.3% 19.3%,
          #da9754 0%,
          #a86420 100.2%
        );
      }
      & svg {
        color: #cd7f32;
      }
    }
    &:hover {
      box-shadow: 0 0 7px 7px #cd7f32;
    }
  }
`;

export const ContentWrapper = styled.div`
  display: grid;
  /* grid-template-columns: 1.2fr 1.2fr 1.2fr 1.2fr 1fr 1fr 1fr; */
  grid-template-rows: 1fr 1.5fr;
  grid-column-gap: 5px;
  text-align: center;
  height: 100%;
`;

export const Score = styled.div`
  display: grid;
  grid-template-rows: 1fr 7fr;
`;
