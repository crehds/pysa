import React from 'react';
import { AdminListOfPlayers } from '../components/AdminListOfPlayers';
import { ListOfPlayers } from '../components/ListOfPlayers';
import { useStateValue } from '../Context';

export const GetPlayers = ({ user }) => {
  // eslint-disable-next-line no-unused-vars
  const [state, dispatch] = useStateValue();
  // console.log(state);
  return user === 'player' ? (
    <ListOfPlayers players={state.ranking} />
  ) : (
    <AdminListOfPlayers players={state.allPlayers} />
  );
};
