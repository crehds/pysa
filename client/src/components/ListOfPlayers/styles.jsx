import styled, { css } from 'styled-components';

export const CarouselWrapper = styled.div`
  /* border: 1px solid red; */
  /* margin: 30px 0; */
  ${({ size }) =>
    css`
      max-width: ${size};
    `}
  overflow-x: scroll;
  overflow-y: hidden;
  padding: 10px;
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
  }
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 4px;
  }
  &::-webkit-scrollbar:hover {
    background: #b3b3b3;
    box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.2);
  }
  &::-webkit-scrollbar:hover:active {
    background: #999;
  }
`;

export const PlayersCarousel = styled.div`
  white-space: nowrap;
  margin: 40px 0;
  &:hover article:hover {
    transform: scale(1.2);
    opacity: 1;
    position: relative;
  }
  &:hover article {
    transform: scale(0.9);
    opacity: 0.3;
  }
`;
