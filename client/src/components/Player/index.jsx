import React from 'react';
import { ContentWrapper, Profile, Score } from './styles';
import { ScoreContent } from './ScoreContent';
import { PlayerImageMedail } from './PlayerImageMedail';
import { ScoreColumnsName } from './ScoreColumnsNames';

export const Player = (props) => {
  return (
    <Profile className='profile' size={props.size}>
      <ContentWrapper>
        <PlayerImageMedail
          name={props.nickname}
          medail={props.medail}
          mmr={props.mmr}
          src={props.imgURL}
          size={props.size}
        />
        <Score>
          <ScoreColumnsName />
          <ScoreContent roles={props.rolesScore} kda={props.kda} />
        </Score>
      </ContentWrapper>
    </Profile>
  );
};
