import { DEFAULT_LANGUAGE } from './detectLanguage';

// Every visible string of the public pages, by language. Keys are the same in
// both languages (a test enforces it). Neutral wording only: no slang.
export const dictionary = {
  es: {
    'language.label': 'Idioma',
    'language.es': 'Español',
    'language.en': 'English',

    'title.brand': 'Pysa',
    'title.ranking': 'Ranking',
    'title.players': 'Jugadores',
    'title.admin': 'Admin',
  },
  en: {
    'language.label': 'Language',
    'language.es': 'Español',
    'language.en': 'English',

    'title.brand': 'Pysa',
    'title.ranking': 'Ranking',
    'title.players': 'Players',
    'title.admin': 'Admin',
  },
};

// The text of `key` in `language`, with {name} placeholders filled from `vars`.
// An unknown language reads as the default one; an unknown key reads as itself,
// so a missing string shows up on screen instead of crashing.
export function translate(language, key, vars) {
  const texts = dictionary[language] ?? dictionary[DEFAULT_LANGUAGE];
  const text = texts[key] ?? key;
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
}
