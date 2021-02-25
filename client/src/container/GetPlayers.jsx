import React from 'react';
import { ListOfPlayers } from '../components/ListOfPlayers';
import { useStateValue } from '../Context';

export const GetPlayers = () => {
  const players = useStateValue();
  return <ListOfPlayers players={players} />;
};
