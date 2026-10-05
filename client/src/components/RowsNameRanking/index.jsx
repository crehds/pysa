import React from 'react';
import { Heading, HeadingRow } from './styles';
import { useLanguage } from '../../i18n/LanguageContext';

// Header row of the ranking table.
export const RowsNameRanking = () => {
  const { t } = useLanguage();
  return (
    <thead>
      <HeadingRow>
        <Heading scope='col'>{t('ranking.rank')}</Heading>
        <Heading scope='col'>{t('ranking.player')}</Heading>
        <Heading scope='col' $numeric $optional>
          {t('ranking.games')}
        </Heading>
        <Heading scope='col' $numeric>
          {t('ranking.mmr')}
        </Heading>
        <Heading scope='col' $numeric>
          {t('ranking.kda')}
        </Heading>
        <Heading scope='col' $optional>
          {t('ranking.medal')}
        </Heading>
      </HeadingRow>
    </thead>
  );
};
