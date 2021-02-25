import React from 'react';
import { ContentWrapper, Profile, Score } from './styles';
import { ScoreContent } from './ScoreContent';
import { PlayerImageMedail } from './PlayerImageMedail';
import { ScoreColumnsName } from './ScoreColumnsNames';

export const Player = (props) => {
  return (
    <Profile>
      <ContentWrapper>
        <PlayerImageMedail
          nombre={props.nombre}
          medail={props.medail}
          mmr={props.sumaMMR}
        />
        <Score>
          <ScoreColumnsName />
          <ScoreContent roles={props.roles} />
        </Score>
      </ContentWrapper>
    </Profile>
  );
};
