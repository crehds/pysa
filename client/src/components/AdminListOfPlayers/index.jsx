import React, { useReducer } from 'react';
import { WrapperDiv } from '../WrapperDiv';
import { PlayerFocus } from './PlayerFocus';
import { SearchBar } from './SearchBar';
import {
  AdminPlayersCarousel,
  IconUserOverlay,
  IconUserWrapper,
} from './styles';
import { PlayerToFocus } from './PlayerToFocus';
import { FaUserPlus, FaUserMinus } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useStateValue } from '../../Context';

function randomPlayer(playersLength) {
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
        return player.nickname.toLowerCase() === nickname.toLowerCase();
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
    case 'update':
      console.log('update');
      return {
        ...state,
        length: action.payload - 1,
        previousPlayer:
          state.previousPlayer === state.length
            ? action.payload - 1
            : state.previousPlayer,
        nextPlayer:
          state.nextPlayer === 0 ? action.payload - 1 : state.nextPlayer,
      };

    default:
      break;
  }
}

// function showInfoDev() {
//   Swal.fire('En Desarrollo', '', 'info');
// }

const dataforRol = {
  victories: 0,
  victoriesDouble: 0,
  defeats: 0,
  defeatsDouble: 0,
  kills: 0,
  deaths: 0,
  assists: 0,
};

const Roles = [
  {
    name: 'Hard Carry',
    score: {
      ...dataforRol,
    },
  },
  {
    name: 'Mid Laner',
    score: {
      ...dataforRol,
    },
  },
  {
    name: 'Off Laner',
    score: {
      ...dataforRol,
    },
  },
  {
    name: 'Soft Support',
    score: {
      ...dataforRol,
    },
  },
  {
    name: 'Hard Support',
    score: {
      ...dataforRol,
    },
  },
];

export const AdminListOfPlayers = ({ players, handleLoading }) => {
  const initialValue = randomPlayer(players.length);
  console.log(initialValue);
  const [state, dispatch] = useReducer(reducer, initialValue);
  const [contextState, contextdispatch] = useStateValue();

  function searchPlayer(player) {
    dispatch({ type: 'search', payload: player, array: players });
  }

  async function addNewPlayer(arrPlayers) {
    console.log(arrPlayers);
    const uri =
      process.env.NODE_ENV === 'development'
        ? '/'
        : 'https://pysa-production.up.railway.app/';
    const arrNamesPlayers = arrPlayers.split(',');
    const body = arrNamesPlayers.map((e) => ({
      name: {
        firstName: '',
        lastName: '',
      },
      medail: 'Sin Calibrar',
      nickname: e,
      estado: 1,
      rolesScore: [...Roles],
      calibration: {
        estado: 1,
        remainingGames: 10,
        initialMMR: 1800,
      },
      mmr: 0,
      imgURL: '/default/default-user.png',
    }));
    let result = await fetch(`${uri}players/addNewPlayers`, {
      method: 'POST',
      body: JSON.stringify({ players: body }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((result) => result.json());
    return result;
  }

  async function deletePlayer(arrPlayers) {
    const uri =
      process.env.NODE_ENV === 'development'
        ? '/'
        : 'https://pysa-production.up.railway.app/';
    const arrNamesPlayers = arrPlayers.split(',');
    const arrIdPlayers = contextState.allPlayers
      .filter((element) =>
        arrNamesPlayers.some(
          (namePlayer) =>
            namePlayer.toLowerCase() === element.nickname.toLowerCase()
        )
      )
      .map((playerFiltred) => playerFiltred['_id']);
    let result = await fetch(`${uri}players/deleteAllDataOfPlayers`, {
      method: 'DELETE',
      body: JSON.stringify({ playersIds: arrIdPlayers }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((result) => result.json());
    return result;
  }

  async function handleDeletePlayer() {
    Swal.fire({
      title: 'Eliminar jugador(es)',
      input: 'text',
      inputLabel: 'Nickname(s)',
      inputPlaceholder: 'Jugador1,jugador2,... o solo Jugador1',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'Ningún nombre ingresado';
        }
      },
      preConfirm: async (playersString) => {
        const html = document.getElementsByClassName(
          'swal2-container swal2-center swal2-backdrop-show'
        );
        html[0].style.display = 'none';
        handleLoading(false);
        return await deletePlayer(playersString);
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const deletedPlayersLength = result.value.body.length;
        const payload = result.value.body.map((e) => e.deletedPlayer.playerId);
        contextdispatch({ type: 'DELETE_PLAYER', payload });
        handleLoading(true);
        Swal.fire('Elimiando(s) y actualizado con éxito', '', 'success');
      }
    });
  }

  async function handleAddNewPlayer() {
    Swal.fire({
      title: 'Añadir jugador(es)',
      input: 'text',
      inputLabel: 'Nickname(s)',
      inputPlaceholder: 'Jugador1,jugador2,... o solo Jugador1',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'Ningún nombre ingresado';
        }
      },
      showLoaderOnConfirm: true,
      preConfirm: async (playersString) => {
        return await addNewPlayer(playersString);
      },
    }).then((results) => {
      if (results.isConfirmed) {
        console.log(results);
        const newPlayersLength = results.value.body.length;
        let savedPlayers = results.value.body.map((e) => ({
          ...e['_doc'],
          rolesScore: [...e.rolesScore],
        }));
        contextdispatch({ type: 'ADD_PLAYER', payload: savedPlayers });
        dispatch({
          type: 'update',
          payload: state.length + 1 + newPlayersLength,
        });
        Swal.fire('Guardado y actualizado con éxito', '', 'success');
      }
    });
  }

  return (
    <WrapperDiv>
      <AdminPlayersCarousel>
        <IconUserOverlay>
          <IconUserWrapper>
            <FaUserPlus onClick={handleAddNewPlayer} />
            <FaUserMinus onClick={handleDeletePlayer} />
          </IconUserWrapper>
        </IconUserOverlay>

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
