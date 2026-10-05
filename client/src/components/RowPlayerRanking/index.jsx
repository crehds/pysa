import React from 'react';
import { Cell, NameCell, Rank, Row } from './styles';
import { useLanguage } from '../../i18n/LanguageContext';

export const RowPlayerRanking = ({ rank, name, partidas, mmr, kda, medail }) => {
  const { medal } = useLanguage();
  // Ranks 1-3 are the podium (and the Players cards), so the table never shows
  // them: its ranks are plain numbers.
  return (
    <Row>
      <Cell>
        <Rank>{rank}</Rank>
      </Cell>
      <NameCell>{name}</NameCell>
      <Cell $numeric $optional>
        {partidas}
      </Cell>
      <Cell $numeric>{mmr}</Cell>
      <Cell $numeric>{kda}</Cell>
      <Cell $optional>{medal(medail)}</Cell>
    </Row>
  );
};
