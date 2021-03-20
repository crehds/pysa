import styled, { keyframes } from 'styled-components';

const Wave = keyframes`
  50%,
  75% {
    transform: scale(2.5);
  }

  80%,
  100% {
    opacity: 0;
  }
`;

export const LoadingWrapper = styled.div`
  /* colors: #7ef9ff, #89cff0, #4682b4, #0f52ba, #000080; */
  display: flex;
  /* z-index:9999; */
  & div {
    position: relative;
    width: 1.5em;
    height: 1.5em;
    margin: 0.8em;
    border-radius: 50%;
    &::before {
      position: absolute;
      content: '';
      width: 100%;
      height: 100%;
      top: 0;
      right: 0;
      background: inherit;
      border-radius: inherit;
      animation: ${Wave} 2s ease-out infinite;
    }

    &:nth-child(1) {
      background-color: rgba(238, 211, 214, 0.89);
      &::before {
        animation-delay: 0.2s;
      }
    }
    &:nth-child(2) {
      background-color: rgba(196, 84, 93, 0.692);
      &::before {
        animation-delay: 0.4s;
      }
    }
    &:nth-child(3) {
      background-color: rgba(218, 61, 82, 0.76);
      &::before {
        animation-delay: 0.6s;
      }
    }
    &:nth-child(4) {
      background-color: rgba(230, 17, 45, 0.678);
      &::before {
        animation-delay: 0.8s;
      }
    }
    &:nth-child(5) {
      background-color: rgba(245, 4, 36, 0.89);
      &::before {
        animation-delay: 1s;
      }
    }
  }
`;
