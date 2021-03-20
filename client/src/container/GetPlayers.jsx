import React, { useState } from 'react';
import { AdminListOfPlayers } from '../components/AdminListOfPlayers';
import { ListOfPlayers } from '../components/ListOfPlayers';
import { useStateValue } from '../Context';
import { Loader } from '../loaders';

export const GetPlayers = ({ user }) => {
  // eslint-disable-next-line no-unused-vars
  const [stateContext, dispatch] = useStateValue();
  const [loadingAdmin, setLoadingAdmin] = useState(true);

  function handleLoading(boolean) {
    setLoadingAdmin(boolean);
  }

  return user === 'player' ? (
    <ListOfPlayers players={stateContext.ranking} />
  ) : loadingAdmin ? (
    <AdminListOfPlayers
      players={stateContext.allPlayers}
      handleLoading={handleLoading}
    />
  ) : (
    <Loader />
  );
};
