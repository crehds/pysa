import styled from 'styled-components';

export const PlayerImageWrapper = styled.div`
  /* border: 1px solid red; */
  display: grid;
  grid-template-rows: 1fr 7fr;
  grid-template-columns: 1fr 3fr;
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
  max-width: 100%;
  height: auto;
  display: flex;
  justify-content: center;
  & img {
    width: 60%;
    /* max-height: 10%; */
  }
`;
