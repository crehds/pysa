import React from 'react';
import { RankingTable} from './styles';
import { useStateValue } from '../../Context';
import { Positions } from '../Positions';
import { PlayersInRanking } from '../PlayersInRanking';
import { RowsNameRanking } from '../RowsNameRanking';

export const Ranking = () => {
  const value = useStateValue();
  console.log(typeof value);
  return (
    <RankingTable>
      <RowsNameRanking/>
      <Positions positions={value.length} />
      <PlayersInRanking players={value} />
    </RankingTable>
  );
};
