import { useEffect, useState } from 'react';
import { useStateValue } from '../Context';
import { API_BASE_URL } from '../config';

export function useGetData(loadingApp) {
  const [state, dispatch] = useStateValue();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getDataPlayers() {
      try {
        // console.log('trayendo data');
        const players = await fetch(
          `${API_BASE_URL}/players/getAllPlayers`
        ).then((result) => result.json());
        const playersIds = players.body.map((player) => player['_id']);

        const scorePlayers = await fetch(
          `${API_BASE_URL}/scores/getScoreOfPlayers`,
          {
            method: 'post',
            body: JSON.stringify({ playersIds: [...playersIds] }),
            headers: {
              'Content-Type': 'application/json',
            },
          }
        ).then((result) => result.json());

        const medails = await fetch(`${API_BASE_URL}/medails/getMedails`).then(
          (result) => result.json()
        );

        const roles = await fetch(`${API_BASE_URL}/roles/getRoles`).then(
          (result) => result.json()
        );

        dispatch({
          type: 'SET_DATA',
          payload: {
            players: players.body,
            scorePlayers: scorePlayers.body,
            medails: medails.body,
            roles: roles.body,
          },
        });
        setLoading(true);
      } catch (error) {
        console.error(error);
        setLoading(null);
      }
    }

    if (!loadingApp) {
      getDataPlayers();
    }
  }, [loadingApp, dispatch]);

  return [loading, setLoading];
}
