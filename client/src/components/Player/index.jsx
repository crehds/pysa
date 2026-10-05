import React, { useId } from 'react';
import { Card, Score } from './styles';
import { ScoreContent } from './ScoreContent';
import { PlayerImageMedail } from './PlayerImageMedail';
import { ScoreColumnsName } from './ScoreColumnsNames';

// One player's card: the header (rank, name, medal, MMR) and the stats. The
// article is named by its heading.
export const Player = (props) => {
  const headingId = useId();
  return (
    <Card aria-labelledby={headingId} $rank={props.rank}>
      <PlayerImageMedail
        headingId={headingId}
        rank={props.rank}
        name={props.nickname}
        medail={props.medail}
        mmr={props.mmr}
        src={props.imgURL}
      />
      <Score>
        <ScoreColumnsName />
        <ScoreContent roles={props.rolesScore} kda={props.kda} />
      </Score>
    </Card>
  );
};
