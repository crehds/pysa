import React from 'react';
import { AdminListOfPlayers } from '../components/AdminListOfPlayers';
import { ListOfPlayers } from '../components/ListOfPlayers';
import { useStateValue } from '../Context';

export const GetPlayers = ({ user }) => {
  const [state,dispatch] = useStateValue();
  console.log(state);
  return user === 'player' ? (
    <ListOfPlayers players={state.ranking} />
  ) : (
    <AdminListOfPlayers players={state} />
  );
};
