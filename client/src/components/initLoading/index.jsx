import React from 'react';
import logo from '../../assets/logo_pysa_6.png';
import { LoaderLogo, Screen } from './styles.jsx';
import { useLanguage } from '../../i18n/LanguageContext';
import { useMotionLevel } from '../../motion/MotionContext';

// The fast loader: every load after the first one in a tab, and every load for
// a visitor who wants no motion. Only the logo, pulsing unless motion is off.
// Lite keeps the pulse on purpose: lite has no decorative loops, but this one
// is functional "loading" feedback, and lite visitors (slow connections) wait
// the longest.
export const Loading = () => {
  const { t } = useLanguage();
  const level = useMotionLevel();
  return (
    <Screen role='status' aria-label={t('loading')}>
      {/* Decorative: the container above already carries the accessible name. */}
      <LoaderLogo src={logo} alt='' $pulse={level !== 'none'} />
    </Screen>
  );
};
