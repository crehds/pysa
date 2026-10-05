import React from 'react';
import { GiMedal } from 'react-icons/gi';
import {
  Avatar,
  Badge,
  Header,
  Identity,
  Medal,
  Mmr,
  MmrLabel,
  MmrValue,
  Name,
} from './styles';
import { VisuallyHidden } from '../../../styles/VisuallyHidden';
import { metalLabels } from '../../../styles/podium';
import { playerImageSrc } from '../../../utils/playerImage';

// The card header: rank, avatar, name (the card's heading), medal and MMR.
export const PlayerImageMedail = ({ headingId, rank, name, medail, mmr, src }) => {
  const metal = metalLabels[rank - 1];
  return (
    <Header>
      <Badge $rank={rank}>
        {rank}
        {metal && <VisuallyHidden>, {metal}</VisuallyHidden>}
      </Badge>
      <Avatar src={playerImageSrc(src)} alt={`Foto de ${name}`} />
      <Identity>
        <Name id={headingId}>{name}</Name>
        <Medal>
          <GiMedal aria-hidden='true' />
          {medail}
        </Medal>
      </Identity>
      <Mmr>
        <MmrLabel>MMR</MmrLabel> <MmrValue>{mmr}</MmrValue>
      </Mmr>
    </Header>
  );
};
