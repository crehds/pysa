import React, { useEffect, useState } from 'react';
import { Info, RankingTable } from './styles';
import { useStateValue } from '../../Context';
import { Positions } from '../Positions';
import { PlayersInRanking } from '../PlayersInRanking';
import { RowsNameRanking } from '../RowsNameRanking';
import { ImInfo } from 'react-icons/im';
import { Medails } from '../Medails';
import { WrapperDiv } from '../WrapperDiv';

export const Ranking = () => {
  const [state, dispatch] = useStateValue();
  const [width, setWidth] = useState();
  function onMouseEnter() {
    let medails = document.getElementById('medails');
    medails.style.display = 'grid';
  }
  function onMouseLeave() {
    let medails = document.getElementById('medails');
    medails.style.display = 'none';
  }

  useEffect(() => {
    let rankingWidth = document.getElementById('app').offsetWidth - 60;

    const onResize = () => {
      let newRankingWidth = document.getElementById('app').offsetWidth - 60;
      setWidth(newRankingWidth);
    };

    window.addEventListener('resize', onResize);
    setWidth(rankingWidth);
    return () => {
      return window.removeEventListener('resize', onResize);
    };
  }, [width]);

  return (
    <WrapperDiv>
      <RankingTable size={width}>
        <Medails />
        <Info onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
          <ImInfo size='30px' />
        </Info>
        <RowsNameRanking />
        <Positions positions={state.ranking.length} />
        <PlayersInRanking players={state.ranking} />
      </RankingTable>
    </WrapperDiv>
  );
};
