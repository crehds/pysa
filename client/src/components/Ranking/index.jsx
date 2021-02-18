import React from 'react';
import { Name, RankingTable, RowName, RowsNames } from './styles';
import { ImTrophy } from 'react-icons/im';
import { Player } from '../Player';
import { useStateValue } from '../../Context';

export const Ranking = () => {
  const value = useStateValue();
  console.log(value);
  return (
    <RankingTable>
      <RowsNames>
        <RowName>
          <ImTrophy color='gold' size='30px' />
        </RowName>
        <RowName>
          <Name>Player</Name>
        </RowName>
        <RowName>
          <Name>Nº de partidas</Name>
        </RowName>
        <RowName>
          <Name>MMR</Name>
        </RowName>
        <RowName>
          <Name>Medalla</Name>
        </RowName>
      </RowsNames>
      <div>
        {value.map((e, i) => (
          <div key={i}>{i + 1} </div>
        ))}
      </div>

      <div>
        {value.map((player, i) => (
          <Player
            key={i}
            name={player.nombre}
            partidas={player.partidas}
            mmr={player.sumaMMR}
            medail={player.medail}
          />
        ))}
      </div>
    </RankingTable>
  );
};
