import React from 'react';
import { Info, RankingTable } from './styles';
import { useStateValue } from '../../Context';
import { Positions } from '../Positions';
import { PlayersInRanking } from '../PlayersInRanking';
import { RowsNameRanking } from '../RowsNameRanking';
import { ImInfo } from 'react-icons/im';
import { Medails } from '../Medails';

export const Ranking = () => {
  const value = useStateValue();
  function onMouseEnter() {
    let medails = document.getElementById('medails');
    medails.style.display = 'block';
  }
  function onMouseLeave() {
    let medails = document.getElementById('medails');
    medails.style.display = 'none';
  }
  return (
    <RankingTable>
      <Medails />
      <Info onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <ImInfo size='30px' />
      </Info>
      <RowsNameRanking />
      <Positions positions={value.length} />
      <PlayersInRanking players={value} />
    </RankingTable>
  );
};
