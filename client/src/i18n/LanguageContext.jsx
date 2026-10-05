import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_LANGUAGE,
  detectLanguage,
  isSupportedLanguage,
  storeLanguage,
} from './detectLanguage';
import { translate } from './dictionary';
import { medalName } from './medals';

// Without a provider (a component rendered on its own) the site speaks the
// default language and the switch does nothing.
const fallback = {
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (key, vars) => translate(DEFAULT_LANGUAGE, key, vars),
  medal: (name) => medalName(name, DEFAULT_LANGUAGE),
};

const LanguageContext = createContext(fallback);

// Holds the current language: detected once on load (a stored choice first),
// changed by the switch, remembered by it, and mirrored into <html lang>.
// `t(key, vars)` reads the dictionary; `medal(name)` shows a medal name from the
// database (Spanish) in the current language.
export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => detectLanguage());

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((next) => {
    if (!isSupportedLanguage(next)) return;
    storeLanguage(next);
    setLanguageState(next);
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key, vars) => translate(language, key, vars),
      medal: (name) => medalName(name, language),
    }),
    [language, setLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
