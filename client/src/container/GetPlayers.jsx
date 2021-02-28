import React from 'react';
import { AdminListOfPlayers } from '../components/AdminListOfPlayers';
import { ListOfPlayers } from '../components/ListOfPlayers';
import { useStateValue } from '../Context';

export const GetPlayers = ({ user }) => {
  const players = useStateValue();
  return user === 'player' ? (
    <ListOfPlayers players={players} />
  ) : (
    <AdminListOfPlayers players={players} />
  );
};
