import React from 'react';
import { Player } from '../Player';
import { EmptyRanking } from '../EmptyRanking';
import { PlayersGrid } from './styles';

// `players` is already sorted by ranking, so the rank is the position.
export const ListOfPlayers = ({ players }) =>
  players.length === 0 ? (
    <EmptyRanking />
  ) : (
    <PlayersGrid role='list' aria-label='Lista de jugadores'>
      {players.map((player, i) => (
        <li key={player._id ?? i}>
          <Player {...player} rank={i + 1} />
        </li>
      ))}
    </PlayersGrid>
  );
