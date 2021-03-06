import React, { useEffect, useState } from 'react';
import { Player } from '../Player';
import { WrapperDiv } from '../WrapperDiv';
import { CarouselWrapper, PlayersCarousel } from './styles';

export const ListOfPlayers = ({ players }) => {
  const [width, setWidth] = useState();

  useEffect(() => {
    let carouselWidth = document.getElementById('app').offsetWidth - 60;

    const onResize = () => {
      let newCarouselWidth = document.getElementById('app').offsetWidth - 60;
      setWidth(newCarouselWidth);
    };

    window.addEventListener('resize', onResize);
    setWidth(carouselWidth);
    return () => {
      return window.removeEventListener('resize', onResize);
    };
  }, [width]);

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
