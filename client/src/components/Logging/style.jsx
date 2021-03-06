import styled from 'styled-components';

export const LoggingWrapper = styled.div`
  position: absolute;
  top: 10px;
  right: 20px;
  & div {
    cursor: pointer;
    display: flex;
    align-items: center;
    :hover {
      > svg {
        fill: white;
      }
      > p {
        color: rgba(214, 122, 122, 0.863);
      }
    }
    & p {
      color: rgb(201, 187, 187);
      font-family: 'Oswald';
    }
    & svg {
      color: gray;
    }
  }
`;
