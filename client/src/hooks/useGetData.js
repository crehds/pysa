import { useEffect, useState } from 'react';
import { useStateValue } from '../Context';

export function useGetData(loadingApp) {
  const [state, dispatch] = useStateValue();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getDataPlayers() {
      try {
        console.log('trayendo data');
        const players = await fetch('https://pysabackend.herokuapp.com/players/getAllPlayers').then((result) =>
          result.json()
        );

        const playersIds = players.body.map((player) => player['_id']);

        const scorePlayers = await fetch('https://pysabackend.herokuapp.com/scores/getScoreOfPlayers', {
          method: 'post',
          body: JSON.stringify({ playersIds: [...playersIds] }),
          headers: {
            'Content-Type': 'application/json',
          },
        }).then((result) => result.json());

        const medails = await fetch('https://pysabackend.herokuapp.com/medails/getMedails').then((result) =>
          result.json()
        );

        const roles = await fetch('https://pysabackend.herokuapp.com/roles/getRoles').then(result => result.json());

        dispatch({
          type: 'SET_DATA',
          payload: {
            players: players.body,
            scorePlayers: scorePlayers.body,
            medails: medails.body,
            roles:roles.body
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

  return loading;
}
