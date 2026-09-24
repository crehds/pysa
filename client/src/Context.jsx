import React, { createContext, useContext, useReducer } from 'react';
import {
  addPlayers,
  dataForApp,
  deletePlayers,
  updateImagePlayer,
  updatingPlayer,
} from './utils/Context';
const Context = createContext();

let initialState = {
  // null = not yet known: useCheckAuth (client/src/hooks/useCheckAuth.js)
  // resolves this from GET /auth/me on app load instead of trusting
  // anything stored client-side. App.jsx treats null as "wait" so a
  // logged-in admin reloading /adminPlayers is not bounced to / before the
  // check finishes.
  isAuth: null,
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
        let stateWithUpdatedPlayer = updatingPlayer(
          state,
          action.payload,
          'Calibrado'
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
    case 'ADD_PLAYER':
      console.log(action.payload);
      let stateWithNewPlayers = addPlayers(state, action.payload);

      console.log(stateWithNewPlayers);
      return {
        ...stateWithNewPlayers,
      };
    case 'DELETE_PLAYER':
      const stateWithDeletedPlayers = deletePlayers(state, action.payload);

      return {
        ...stateWithDeletedPlayers,
      };
    case 'UPDATE_IMAGE':
      let stateWithUpdatedImage = updateImagePlayer(state, action.payload);
      return {
        ...stateWithUpdatedImage,
      };
    case 'LOGIN':
      return {
        ...state,
        isAuth: true,
      };
    case 'UNLOGIN':
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
