import styled from 'styled-components';

export const PlayerImageWrapper = styled.div`
  border: 1px solid red;
  display: grid;
  grid-template-rows: 1fr 7fr;
  grid-template-columns: 1fr 3fr;
  grid-row-gap: 5px;
  text-align: center;
  /* max-height: 100%; */
`;

export const NamePlayer = styled.div`
  grid-column: 1 / 3;
  & p {
    /* padding: 5px 0; */
    font-size: 17px;
  }
`;

export const Icon = styled.div`
  border: 1px solid red;
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