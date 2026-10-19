import React from 'react';
import logo from '../../assets/logo_pysa_6.png';
import { Img, Screen } from './styles.jsx';
import { useLanguage } from '../../i18n/LanguageContext';

export const Loading = () => {
  const { t } = useLanguage();
  return (
    <Screen role='status' aria-label={t('loading')}>
      {/* Decorative: the container above already carries the accessible name. */}
      <Img src={logo} alt='' />
    </Screen>
  );
};
