import React from 'react';
import { ImArrowRight2 } from 'react-icons/im';
import { Button } from './styles';
import { NAV_ID } from '../NavBar';
import { useLanguage } from '../../i18n/LanguageContext';

export const ShowMenuButton = ({ onClick, buttonRef }) => {
  const { t } = useLanguage();
  return (
    <Button
      type='button'
      ref={buttonRef}
      onClick={onClick}
      aria-expanded='false'
      aria-controls={NAV_ID}
    >
      <ImArrowRight2 aria-hidden='true' />
      {t('nav.show')}
    </Button>
  );
};
