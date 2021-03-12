import styled from 'styled-components';

export const SearchWrapper = styled.div`
  /* border: 1px solid red; */
  grid-column: 2 / 3;
  padding: 0px 0;
  display: flex;
  justify-content: center;
`;
export const InputWrapper = styled.form`
  /* border: 1px solid gray;
  border */
  position: relative;
  width: 60%;
`;

export const Input = styled.input`
  border: 3px solid rgb(118, 141, 158);
  border-radius: 5px;
  width: 100%;
  font-size: 18px;
  text-align: center;
  font-family: 'Source Sans Pro';
  color: rgba(58, 54, 54, 0.836);
  &::placeholder {
    text-align: center;
  }
  &:focus {
    outline:none;
    border: 3px solid rgba(5, 93, 161, 0.742);
  }
`;

export const Icon = styled.button`
  position: absolute;
  right: 8px;
  top: 6px;
  & svg {
    color: gray;
    font-size: 18px;
  }
`;
