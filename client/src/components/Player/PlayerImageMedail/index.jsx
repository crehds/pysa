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
import { metalKeys } from '../../../styles/podium';
import { playerImageSrc } from '../../../utils/playerImage';
import { useLanguage } from '../../../i18n/LanguageContext';

// The card header: rank, avatar, name (the card's heading), medal and MMR.
export const PlayerImageMedail = ({ headingId, rank, name, medail, mmr, src }) => {
  const { t, medal } = useLanguage();
  const metalKey = metalKeys[rank - 1];
  return (
    <Header>
      <Badge $rank={rank}>
        {rank}
        {metalKey && <VisuallyHidden>, {t(metalKey)}</VisuallyHidden>}
      </Badge>
      <Avatar src={playerImageSrc(src)} alt={t('player.photo', { name })} />
      <Identity>
        <Name id={headingId}>{name}</Name>
        <Medal>
          <GiMedal aria-hidden='true' />
          {medal(medail)}
        </Medal>
      </Identity>
      <Mmr>
        <MmrLabel>MMR</MmrLabel> <MmrValue>{mmr}</MmrValue>
      </Mmr>
    </Header>
  );
};
