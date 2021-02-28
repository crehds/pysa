import React from 'react';
import {
  ImagesWrapper,
  KDA,
  PlayerTotalsWrapper,
  Sub2Total,
  Sub2TotalColumns,
  SubTotal,
  SubTotalKDA,
  TotalColumns,
  TotalDiv,
} from './styles';

export const PlayerTotals = (props) => {
  console.log(props);
  console.log(props.state);
  let victorias =
    props.state['hard carry'].victorias +
    props.state['midlaner'].victorias +
    props.state['offlaner'].victorias +
    props.state['soft support'].victorias +
    props.state['support'].victorias;
  let derrotas =
    props.state['hard carry'].derrotas +
    props.state['midlaner'].derrotas +
    props.state['offlaner'].derrotas +
    props.state['soft support'].derrotas +
    props.state['support'].derrotas;
  let victoriasDouble =
    props.state['hard carry'].victoriasDouble +
    props.state['midlaner'].victoriasDouble +
    props.state['offlaner'].victoriasDouble +
    props.state['soft support'].victoriasDouble +
    props.state['support'].victoriasDouble;
  let derrotasDouble =
    props.state['hard carry'].derrotasDouble +
    props.state['midlaner'].derrotasDouble +
    props.state['offlaner'].derrotasDouble +
    props.state['soft support'].derrotasDouble +
    props.state['support'].derrotasDouble;
  let kills =
    props.state['hard carry'].kills +
    props.state['midlaner'].kills +
    props.state['offlaner'].kills +
    props.state['soft support'].kills +
    props.state['support'].kills;
  let deaths =
    props.state['hard carry'].deaths +
    props.state['midlaner'].deaths +
    props.state['offlaner'].deaths +
    props.state['soft support'].deaths +
    props.state['support'].deaths;
  let assists =
    props.state['hard carry'].assists +
    props.state['midlaner'].assists +
    props.state['offlaner'].assists +
    props.state['soft support'].assists +
    props.state['support'].assists;
  return (
    <PlayerTotalsWrapper>
      <TotalDiv>Total</TotalDiv>
      <SubTotal>
        <Sub2Total>
          <Sub2TotalColumns>
            <TotalColumns>
              <p>{props.roles.victorias}</p>
              <p>{props.roles.victorias + victorias}</p>
            </TotalColumns>
            <TotalColumns>
              <p>{props.roles.victoriasDouble} </p>
              <p>{props.roles.victoriasDouble + victoriasDouble}</p>
            </TotalColumns>
          </Sub2TotalColumns>
          <TotalColumns>
            <p>{props.roles.victorias + props.roles.victoriasDouble} </p>
            <p>
              {props.roles.victorias +
                props.roles.victoriasDouble +
                victorias +
                victoriasDouble}
            </p>
          </TotalColumns>
        </Sub2Total>
        <Sub2Total>
          <Sub2TotalColumns>
            <TotalColumns>
              <p>{props.roles.derrotas} </p>
              <p>{props.roles.derrotas + derrotas}</p>
            </TotalColumns>
            <TotalColumns>
              <p>{props.roles.derrotasDouble}</p>
              <p>{props.roles.derrotasDouble + derrotasDouble}</p>
            </TotalColumns>
          </Sub2TotalColumns>
          <TotalColumns>
            <p>{props.roles.derrotas + props.roles.derrotasDouble} </p>
            <p>
              {props.roles.derrotas +
                props.roles.derrotasDouble +
                derrotas +
                derrotasDouble}
            </p>
          </TotalColumns>
        </Sub2Total>
        <TotalColumns style={{ gridColumn: '1 / -1' }}>
          <p>
            {props.roles.victorias +
              props.roles.victoriasDouble +
              props.roles.derrotas +
              props.roles.derrotasDouble}
          </p>
          <p>
            {props.roles.victorias +
              props.roles.victoriasDouble +
              props.roles.derrotas +
              props.roles.derrotasDouble +
              victorias +
              victoriasDouble +
              derrotas +
              derrotasDouble}
          </p>
        </TotalColumns>
      </SubTotal>
      <SubTotalKDA>
        <TotalColumns>
          <p>{props.roles.kills} </p>
          <p>{props.roles.kills + kills}</p>
        </TotalColumns>
        <TotalColumns>
          <p>{props.roles.deaths}</p>
          <p>{props.roles.deaths + deaths} </p>
        </TotalColumns>
        <TotalColumns>
          <p>{props.roles.assists} </p>
          <p>{props.roles.assists + assists}</p>
        </TotalColumns>
        <KDA>
          <p>KDA</p>
          <TotalColumns>
            <p>
              {(
                (props.roles.assists + props.roles.kills) /
                props.roles.deaths
              ).toFixed(2)}
            </p>
            <p>
              {(
                (props.roles.assists + assists + props.roles.kills + kills) /
                  props.roles.deaths +
                deaths
              ).toFixed(2)}
            </p>
          </TotalColumns>
        </KDA>
      </SubTotalKDA>
      <ImagesWrapper>
        <div>MMR</div>
        <div>{props.mmr}</div>
        <div>
          {props.mmr +
            victorias * 100 +
            victoriasDouble * 200 -
            derrotas * 100 -
            derrotasDouble * 200}
        </div>
      </ImagesWrapper>
    </PlayerTotalsWrapper>
  );
};
