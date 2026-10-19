import React from 'react';
import { BiRefresh } from 'react-icons/bi';
import { Button } from './styles';
import { useLanguage } from '../../i18n/LanguageContext';

// `floating` is for pages that have no page header to hold it.
export const RefreshButton = ({ onClick, floating = false }) => {
  const { t } = useLanguage();
  return (
    <Button type='button' onClick={onClick} $floating={floating}>
      <BiRefresh aria-hidden='true' />
      {t('refresh')}
    </Button>
  );
};
