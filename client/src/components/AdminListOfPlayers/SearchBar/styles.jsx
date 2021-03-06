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
  border: 2px solid gray;
  border-radius: 5px;
  width: 100%;
  font-size: 18px;
  text-align: center;
  &::placeholder {
    text-align: center;
  }
`;

export const Icon = styled.button`
  position: absolute;
  right: 8px;
  top: 4px;
  & svg {
    color: gray;
    font-size: 18px;
  }
`;
