import React, { useReducer } from 'react';
import { WrapperDiv } from '../WrapperDiv';
import { PlayerFocus } from './PlayerFocus';
import { SearchBar } from './SearchBar';
import { AdminPlayersCarousel } from './styles';
import { PlayerToFocus } from './PlayerToFocus';

function randomPlayer(playersLength) {
  // let max = players.length - 3;
  let number = Math.floor(Math.random() * (playersLength - 2 - 2 + 1) + 2);
  return {
    length: playersLength - 1,
    previousPlayer: number - 1,
    focusPlayer: number,
    nextPlayer: number + 1,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'left':
      return {
        ...state,
        previousPlayer:
          state.previousPlayer === 0 ? state.length : state.previousPlayer - 1,
        focusPlayer:
          state.focusPlayer === 0 ? state.length : state.focusPlayer - 1,
        nextPlayer:
          state.nextPlayer === 0 ? state.length : state.nextPlayer - 1,
      };
    case 'right':
      return {
        ...state,
        previousPlayer:
          state.previousPlayer === state.length ? 0 : state.previousPlayer + 1,
        focusPlayer:
          state.focusPlayer === state.length ? 0 : state.focusPlayer + 1,
        nextPlayer:
          state.nextPlayer === state.length ? 0 : state.nextPlayer + 1,
      };
    case 'search':
      const nickname = action.payload;
      const players = action.array;
      let playerSearched = players.findIndex((player) => {
        return player.nickname === nickname;
      });

      if (playerSearched === -1) {
        return {
          ...state,
        };
      } else {
        return {
          ...state,
          previousPlayer:
            playerSearched === 0 ? state.length : playerSearched - 1,
          focusPlayer: playerSearched,
          nextPlayer: playerSearched === state.length ? 0 : playerSearched + 1,
        };
      }
    default:
      break;
  }
}

export const AdminListOfPlayers = ({ players }) => {
  const initialValue = randomPlayer(players.length);
  const [state, dispatch] = useReducer(reducer, initialValue);

  function searchPlayer(player) {
    dispatch({ type: 'search', payload: player, array: players });
  }

  return (
    <WrapperDiv>
      <AdminPlayersCarousel>
        {/* {console.log('renderizado')} */}
        <SearchBar searchPlayer={searchPlayer} />
        <PlayerToFocus
          dispatch={dispatch}
          direction='left'
          player={players[state.previousPlayer].nickname}
        />
        <PlayerFocus player={players[state.focusPlayer]} />
        <PlayerToFocus
          dispatch={dispatch}
          direction='right'
          player={players[state.nextPlayer].nickname}
        />
      </AdminPlayersCarousel>
    </WrapperDiv>
  );
};
