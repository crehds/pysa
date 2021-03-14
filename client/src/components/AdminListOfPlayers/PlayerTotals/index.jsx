import React, { useEffect } from 'react';
import {
  ButtonsWrapper,
  KDA,
  MMRWrapper,
  PlayerTotalsWrapper,
  Sub2Total,
  Sub2TotalColumns,
  SubTotal,
  SubTotalKDA,
  TotalColumns,
  TotalDiv,
} from './styles';

export const PlayerTotals = (props) => {
  // console.log(props);
  // console.log(props.state);
  function onClick(event, mmr, partidas) {
    props.test(mmr, partidas);
  }
  let victories =
    props.state['Hard Carry'].victories +
    props.state['Mid Laner'].victories +
    props.state['Off Laner'].victories +
    props.state['Soft Support'].victories +
    props.state['Hard Support'].victories;
  let defeats =
    props.state['Hard Carry'].defeats +
    props.state['Mid Laner'].defeats +
    props.state['Off Laner'].defeats +
    props.state['Soft Support'].defeats +
    props.state['Hard Support'].defeats;
  let victoriesDouble =
    props.state['Hard Carry'].victoriesDouble +
    props.state['Mid Laner'].victoriesDouble +
    props.state['Off Laner'].victoriesDouble +
    props.state['Soft Support'].victoriesDouble +
    props.state['Hard Support'].victoriesDouble;
  let defeatsDouble =
    props.state['Hard Carry'].defeatsDouble +
    props.state['Mid Laner'].defeatsDouble +
    props.state['Off Laner'].defeatsDouble +
    props.state['Soft Support'].defeatsDouble +
    props.state['Hard Support'].defeatsDouble;
  let kills =
    props.state['Hard Carry'].kills +
    props.state['Mid Laner'].kills +
    props.state['Off Laner'].kills +
    props.state['Soft Support'].kills +
    props.state['Hard Support'].kills;
  let deaths =
    props.state['Hard Carry'].deaths +
    props.state['Mid Laner'].deaths +
    props.state['Off Laner'].deaths +
    props.state['Soft Support'].deaths +
    props.state['Hard Support'].deaths;
  let assists =
    props.state['Hard Carry'].assists +
    props.state['Mid Laner'].assists +
    props.state['Off Laner'].assists +
    props.state['Soft Support'].assists +
    props.state['Hard Support'].assists;
  let mmr =
    props.medail === 'Sin Calibrar'
      ? 1800 +
        props.roles.victories * 100 +
        props.roles.victoriesDouble * 200 -
        props.roles.defeats * 100 -
        props.roles.defeatsDouble * 200
      : props.mmr;
  let newMMR =
    mmr +
    victories * 100 +
    victoriesDouble * 200 -
    defeats * 100 -
    defeatsDouble * 200;
  let newPartidas = victories + victoriesDouble + defeats + defeatsDouble;
  let kda = (props.roles.assists + props.roles.kills) / props.roles.deaths;
  let newkda = undefined;
  if (props.roles.deaths === 0 && deaths === 0) {
    newkda = props.roles.assists + assists + props.roles.kills + kills;
  } else {
    newkda =
      (props.roles.assists + assists + props.roles.kills + kills) /
      (props.roles.deaths + deaths);
  }

  useEffect(() => {
    props.handleUpdateMedail(newMMR, newPartidas)
  }, [newMMR])
  return (
    <PlayerTotalsWrapper>
      <TotalDiv>
        <p>Total</p>
      </TotalDiv>
      <SubTotal>
        <Sub2Total>
          <Sub2TotalColumns>
            <TotalColumns>
              <p>{props.roles.victories}</p>
              <p>{props.roles.victories + victories}</p>
            </TotalColumns>
            <TotalColumns>
              <p>{props.roles.victoriesDouble} </p>
              <p>{props.roles.victoriesDouble + victoriesDouble}</p>
            </TotalColumns>
          </Sub2TotalColumns>
          <TotalColumns>
            <p>{props.roles.victories + props.roles.victoriesDouble} </p>
            <p>
              {props.roles.victories +
                props.roles.victoriesDouble +
                victories +
                victoriesDouble}
            </p>
          </TotalColumns>
        </Sub2Total>
        <Sub2Total>
          <Sub2TotalColumns>
            <TotalColumns>
              <p>{props.roles.defeats} </p>
              <p>{props.roles.defeats + defeats}</p>
            </TotalColumns>
            <TotalColumns>
              <p>{props.roles.defeatsDouble}</p>
              <p>{props.roles.defeatsDouble + defeatsDouble}</p>
            </TotalColumns>
          </Sub2TotalColumns>
          <TotalColumns>
            <p>{props.roles.defeats + props.roles.defeatsDouble} </p>
            <p>
              {props.roles.defeats +
                props.roles.defeatsDouble +
                defeats +
                defeatsDouble}
            </p>
          </TotalColumns>
        </Sub2Total>
        <TotalColumns style={{ gridColumn: '1 / -1' }}>
          <p>
            {props.roles.victories +
              props.roles.victoriesDouble +
              props.roles.defeats +
              props.roles.defeatsDouble}
          </p>
          <p>
            {props.roles.victories +
              props.roles.victoriesDouble +
              props.roles.defeats +
              props.roles.defeatsDouble +
              victories +
              victoriesDouble +
              defeats +
              defeatsDouble}
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
          <div>
            <p>KDA</p>
          </div>
          <TotalColumns>
            <p>
              {typeof kda === 'number' && isFinite(kda) ? kda.toFixed(2) : 0}
            </p>
            <p>
              {typeof newkda === 'number' && isFinite(newkda)
                ? newkda === 0
                  ? 0
                  : newkda.toFixed(2)
                : 'Inválido'}
            </p>
          </TotalColumns>
        </KDA>
      </SubTotalKDA>
      <MMRWrapper>
        <div>MMR</div>
        <div>{mmr}</div>
        <div>{newMMR}</div>
      </MMRWrapper>
      <ButtonsWrapper>
        <button onClick={(e) => onClick(e, newMMR, newPartidas)}>
          Guardar
        </button>
        <button onClick={(e) => props.resetInputs()}>Reset</button>
      </ButtonsWrapper>
    </PlayerTotalsWrapper>
  );
};
