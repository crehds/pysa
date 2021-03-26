import styled from 'styled-components';

export const LoggingWrapper = styled.div`
  position: absolute;
  top: 10px;
  right: 20px;
  z-index: 3000;
  display: flex;
  & div {
    cursor: pointer;
    display: flex;
    align-items: center;
    :hover {
      > .logging__door {
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
  & .logging__refresh {
    cursor: pointer;
    margin-right: 15px;
    &:hover {
      fill: white;
    }
  }
`;
