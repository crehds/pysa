import styled from 'styled-components';

export const FocusWrapper = styled.div`
  grid-column: 2 / 3;
  grid-row: 2 / 3;
  display: grid;
  grid-template-rows: 3fr 5fr;
  font-size: 15px;
  box-shadow: 0 0px 2px 2px rgba(34, 40, 49, 0.9);
  /* padding: 4px; */
  /* margin: 4px; */
`;

export const ImgNameMedailWrapper = styled.div`
  display: grid;
  grid-template-columns: 0.3fr 1fr 0.3fr;
`;

export const ImageWrapper = styled.div`
  max-width: 60%;
  /* margin: 0 auto; */
  & img {
    width: 100%;
  }
`;

export const ImgNameWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  justify-items: center;
  align-items: center;
`;
export const NameWrapper = styled.div`
  background-image: radial-gradient(
    circle 929px at 0.6% 1.3%,
    rgba(247, 251, 10, 0.726) 0.6%,
    rgba(204, 158, 33, 0.984) 78%
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  & h1 {
    /* font-size: 20px; */
    padding: 5px 0;
    font-weight: bold;
  }
`;

export const MedailWrapper = styled.div`
  display: inline-block;
  margin: auto;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  color: #a16262;
  & i {
    font-size: 40px;
  }
  &:nth-of-type(3) {
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-image: radial-gradient(
      circle 929px at 0.6% 1.3%,
      rgba(247, 251, 10, 0.726) 0.6%,
      rgba(204, 158, 33, 0.984) 78%
    );
  }
  & i {
    & p {
    }
  }
`;
