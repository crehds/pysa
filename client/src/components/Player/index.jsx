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
          name={props.nickname}
          medail={props.medail}
          mmr={props.mmr}
        />
        <Score>
          <ScoreColumnsName />
          <ScoreContent roles={props.rolesScore} />
        </Score>
      </ContentWrapper>
    </Profile>
  );
};
