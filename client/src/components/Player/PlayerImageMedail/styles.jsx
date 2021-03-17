import styled, { css } from 'styled-components';

export const PlayerImageWrapper = styled.div`
  /* border: 1px solid red; */
  display: grid;
  /* grid-template-columns: 1fr 3fr; */
  ${({size}) => css`
    grid-template-rows: 1fr ${size / 7}px;
    grid-template-columns: 1fr ${size / 6.5}px;
  `}
  grid-row-gap: 5px;
  text-align: center;

  font-size: 14px;
  /* max-height: 100%; */
`;

export const NamePlayer = styled.div`
  grid-column: 1 / 3;
  & p {
    /* padding: 5px 0; */
    font-family: 'Source Sans Pro';
    font-size: 18px;
    font-weight:bold;
    background-image: radial-gradient(
      circle farthest-corner at 12.3% 19.3%,
      #aa6f57 0%,
      #881e16 100.2%
    );
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    /* &:nth-of-type(1) {
      background-image: radial-gradient(
      circle farthest-corner at 12.3% 19.3%,
      #dbc752 0%,
      rgb(219, 189, 19) 100.2%
    );
    } */
  }
`;

export const Icon = styled.div`
  /* border: 1px solid red; */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  & svg {
    font-size: 30px;
    color: gray;
  }
  & p {
    padding: 5px 0;
    font-family: 'Source Sans Pro';
    font-size: 18px;
    color: #a16262;
  }
`;
export const ImageWrapper = styled.div`
  width: 100%;
  height: auto;
  display: flex;
  justify-content: center;
  padding: 0px 5px;
  & img {
    width: 100%;
    border-radius: 10px;

    /* max-height: 10%; */
  }
`;
