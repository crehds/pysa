import React from 'react';
import { SwitchButton, SwitchGroup } from './styles';
import { useLanguage } from '../../i18n/LanguageContext';

// What each button shows (short) and how it is named (the full language name,
// in that language, which starts with the visible text).
const OPTIONS = [
  { language: 'es', short: 'ES', nameKey: 'language.es' },
  { language: 'en', short: 'EN', nameKey: 'language.en' },
];

// The ES | EN switch: a labeled group of two toggle buttons. aria-pressed says
// which language is on; each button carries its own `lang` so a screen reader
// pronounces the name right.
export const LanguageSwitch = () => {
  const { language, setLanguage, t } = useLanguage();
  return (
    <SwitchGroup role='group' aria-label={t('language.label')}>
      {OPTIONS.map(({ language: option, short, nameKey }) => (
        <SwitchButton
          key={option}
          type='button'
          lang={option}
          aria-label={t(nameKey)}
          aria-pressed={language === option}
          onClick={() => setLanguage(option)}
        >
          {short}
        </SwitchButton>
      ))}
    </SwitchGroup>
  );
};
