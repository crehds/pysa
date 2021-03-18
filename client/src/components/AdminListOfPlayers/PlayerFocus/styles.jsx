import styled, { css } from 'styled-components';

export const FocusWrapper = styled.div`
  grid-column: 2 / 3;
  grid-row: 2 / 3;
  display: grid;
  grid-template-rows: 3fr 5fr;
  font-size: 15px;
  box-shadow: 0 0px 2px 2px rgba(34, 40, 49, 0.9);
  position:relative;
  /* padding: 4px; */
  /* margin: 4px; */
`;

export const ImgNameMedailWrapper = styled.div`
  display: grid;
  grid-template-columns: 0.3fr 1fr 0.3fr;
`;

export const ImageWrapper = styled.div`
  width: 100%;
  height: 100%;
  /* margin: 0 auto; */
  /* grid-column: 2 / -1; */
  & img {
    width: 100%;
    height: 100%;
    border-radius: 5%;
  }
`;

export const ImgNameWrapper = styled.div`
  display: grid;
  ${({size}) => css`
    grid-template-columns: .8fr ${size / 7}px;
    grid-template-rows: ${size / 6.5}px;
  `}
  justify-items: center;
  align-items: center;
  position: relative;
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

export const Form = styled.form`
  display: none;
`;

export const IconsWrapper = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  font-size: 25px;
  & svg {
    color: gray;
    &.icon__control {
      display:none;
    }
  }
`;

