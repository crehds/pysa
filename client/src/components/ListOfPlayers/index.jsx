import React, { useEffect, useState } from 'react';
import { Player } from '../Player';
import { CarouselWrapper, PlayersCarousel } from './styles';

export const ListOfPlayers = ({ players }) => {
  const [width, setWidth] = useState();

  useEffect(() => {
    let carouselWidth = document.getElementById('app').offsetWidth - 60;
    setWidth(carouselWidth);
  }, []);

  return (
    <CarouselWrapper>
      <PlayersCarousel id='playersCarousel' size={`${width}px`}>
        {players.map((player, i) => (
          <Player key={i} {...player} />
        ))}
      </PlayersCarousel>
    </CarouselWrapper>
  );
};