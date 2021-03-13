import React, { createContext, useContext, useReducer } from 'react';
import { dataForApp, updatingPlayer } from './utils/Context';
// import { dataForApp, updatingPlayer } from './utils/Context';
const Context = createContext();

let initialState = {
  isAuth: window.sessionStorage.getItem('token'),
};

const reducer2 = (state, action) => {
  switch (action.type) {
    case 'SET_DATA':
      let data = dataForApp({ ...action.payload });
      return {
        ...state,
        ...action.payload,
        ranking: data.orderedPlayers,
        allPlayers: data.playersWithAllData,
      };
    case 'UPDATE_DATA':
      if (action.payload.updatePlayer.medail !== 'Sin Calibrar') {
<<<<<<< HEAD
        let stateWithUpdatedPlayer = updatingPlayer(
          state,
          action.payload,
          'Calibrado'
=======
        let updatedPlayer = updatingPlayer(state, action.payload);

        let indexInRanking = findPlayer(state.ranking, updatedPlayer['_id']);
        if (indexInRanking === -1) {
          state.ranking.push(updatedPlayer);
        } else {
          state.ranking[indexInRanking] = updatedPlayer;
        }
        sortPlayers(state.ranking);
        let indexInAllPlayers = findPlayer(
          state.allPlayers,
          updatedPlayer['_id']
>>>>>>> master
        );
        return {
          ...stateWithUpdatedPlayer,
        };
      }

      let stateWithUpdatedPlayer = updatingPlayer(
        state,
        action.payload,
        'Sin Calibrar'
      );

      return {
        ...stateWithUpdatedPlayer,
      };
    case 'LOGIN':
      return {
        ...state,
        isAuth: true,
      };
    case 'UNLOGIN':
      window.sessionStorage.removeItem('token');
      return {
        ...state,
        isAuth: false,
      };
    default:
      return state;
  }
};

export const Provider = ({ children }) => (
  <Context.Provider value={useReducer(reducer2, initialState)}>
    {children}
  </Context.Provider>
);

export const useStateValue = () => useContext(Context);
