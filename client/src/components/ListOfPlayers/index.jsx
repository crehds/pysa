import React from 'react';
import { Player } from '../Player';
import { WrapperDiv } from '../WrapperDiv';
import { useGetWidth } from '../../hooks/useGetWidth';
import { CarouselWrapper, PlayersCarousel } from './styles';

export const ListOfPlayers = ({ players }) => {
  const width = useGetWidth();
  console.log(players);
  return (
    <WrapperDiv>
      <CarouselWrapper id='CarouselWrapper' size={`${width}px`}>
        <PlayersCarousel id='playersCarousel'>
          {players.map((player, i) => (
            <Player key={i} {...player} />
          ))}
        </PlayersCarousel>
      </CarouselWrapper>
    </WrapperDiv>
  );
};
