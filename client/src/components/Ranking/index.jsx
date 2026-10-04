import React from 'react';
import { Info, RankingContainer, RankingTable } from './styles';
import { useStateValue } from '../../Context';
import { PlayersInRanking } from '../PlayersInRanking';
import { RowsNameRanking } from '../RowsNameRanking';
import { ImInfo } from 'react-icons/im';
import { Medails } from '../Medails';
import { WrapperDiv } from '../WrapperDiv';

export const Ranking = () => {
  const [state] = useStateValue();

  function onMouseEnter() {
    let medails = document.getElementById('medails');
    medails.style.display = 'grid';
  }
  function onMouseLeave() {
    let medails = document.getElementById('medails');
    medails.style.display = 'none';
  }

  return (
    <WrapperDiv>
      <RankingContainer>
        <Medails />
        <RankingTable aria-label='Ranking'>
          <RowsNameRanking
            medalInfo={
              <Info
                data-testid='medal-info'
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
              >
                <ImInfo aria-hidden='true' size='1em' />
              </Info>
            }
          />
          <PlayersInRanking players={state.ranking} />
        </RankingTable>
      </RankingContainer>
    </WrapperDiv>
  );
};
