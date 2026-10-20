import { dictionary, translate } from './dictionary';

describe('the dictionary', () => {
  test('has exactly the same keys in Spanish and English', () => {
    expect(Object.keys(dictionary.en).sort()).toEqual(Object.keys(dictionary.es).sort());
  });

  test('has no empty text', () => {
    for (const language of ['es', 'en']) {
      for (const [key, text] of Object.entries(dictionary[language])) {
        expect(text, `${language}:${key}`).toMatch(/\S/);
      }
    }
  });
});

describe('the intro', () => {
  test('has its skip label in both languages', () => {
    expect(dictionary.es['intro.skip']).toBe('Saltar intro');
    expect(dictionary.en['intro.skip']).toBe('Skip intro');
  });
});

describe('translate', () => {
  test('returns the text of a key in the given language', () => {
    expect(translate('es', 'language.label')).toBe('Idioma');
    expect(translate('en', 'language.label')).toBe('Language');
  });

  test('falls back to the key itself for a key nobody wrote', () => {
    expect(translate('es', 'no.such.key')).toBe('no.such.key');
  });

  test('falls back to English for a language it does not have', () => {
    expect(translate('fr', 'language.label')).toBe('Language');
  });
});
