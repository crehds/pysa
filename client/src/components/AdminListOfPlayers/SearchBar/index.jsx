import React from 'react';
import { Icon, Input, InputWrapper, SearchWrapper } from './styles';
import { BsSearch } from 'react-icons/bs';

function onSubmit(event, searchPlayer) {
  event.preventDefault();
  const nickname = document.getElementById('searchInput').value;

  searchPlayer(nickname);
}

export const SearchBar = (props) => {
  return (
    <SearchWrapper>
      <InputWrapper onSubmit={(e) => onSubmit(e, props.searchPlayer)}>
        <Input
          id='searchInput'
          type='text'
          placeholder='Ingresa el nickname del jugador a buscar'
          spellCheck='false'
          autoComplete='off'
        />
        <Icon>
          <BsSearch />
        </Icon>
      </InputWrapper>
    </SearchWrapper>
  );
};
