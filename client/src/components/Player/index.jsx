import React, { useId } from 'react';
import { Card, Score } from './styles';
import { PlayerImageMedail } from './PlayerImageMedail';
import { RoleStats } from './RoleStats';
import { glowFor } from '../../styles/podiumMotion';
import { useMotionLevel } from '../../motion/MotionContext';
import { useMountedMotionLevel } from '../../motion/useMountedMotionLevel';

// One player's card: the header (rank, name, medal, MMR) and the stats. The
// article is named by its heading.
export const Player = (props) => {
  const headingId = useId();
  const level = useMountedMotionLevel();
  // Hover has no clock to replay, so it follows the live level.
  const lift = useMotionLevel() !== 'none';
  return (
    <Card aria-labelledby={headingId} $rank={props.rank} $glow={glowFor(level)} $lift={lift}>
      <PlayerImageMedail
        headingId={headingId}
        rank={props.rank}
        name={props.nickname}
        medail={props.medail}
        mmr={props.mmr}
        src={props.imgURL}
      />
      <Score>
        <RoleStats
          name={props.nickname}
          roles={props.rolesScore}
          partidas={props.partidas}
          kda={props.kda}
        />
      </Score>
    </Card>
  );
};
