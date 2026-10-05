import React from 'react';
import { Box, Hint, Message } from './styles';
import { useLanguage } from '../../i18n/LanguageContext';

export const EmptyRanking = () => {
  const { t } = useLanguage();
  return (
    <Box>
      <Message>{t('empty.message')}</Message>
      <Hint>{t('empty.hint')}</Hint>
    </Box>
  );
};
