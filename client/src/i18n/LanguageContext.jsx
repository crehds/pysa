import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_LANGUAGE,
  detectLanguage,
  isSupportedLanguage,
  storeLanguage,
} from './detectLanguage';
import { translate } from './dictionary';

// Without a provider (a component rendered on its own) the site speaks the
// default language and the switch does nothing.
const fallback = {
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (key, vars) => translate(DEFAULT_LANGUAGE, key, vars),
};

const LanguageContext = createContext(fallback);

// Holds the current language: detected once on load (a stored choice first),
// changed by the switch, remembered by it, and mirrored into <html lang>.
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
    }),
    [language, setLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
