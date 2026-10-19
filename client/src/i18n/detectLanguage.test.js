import {
  STORAGE_KEY,
  detectLanguage,
  readStoredLanguage,
  storeLanguage,
} from './detectLanguage';

// An in-memory stand-in for localStorage.
function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value);
    },
  };
}

const blockedStorage = {
  getItem() {
    throw new DOMException('blocked', 'SecurityError');
  },
  setItem() {
    throw new DOMException('blocked', 'SecurityError');
  },
};

// Every input given, so a case never depends on the machine running the tests.
function detect(overrides = {}) {
  return detectLanguage({ languages: [], timeZone: null, storage: memoryStorage(), ...overrides });
}

describe('detectLanguage', () => {
  describe('a stored choice', () => {
    test('wins over a Spanish browser language', () => {
      expect(
        detect({ languages: ['es-ES'], storage: memoryStorage({ [STORAGE_KEY]: 'en' }) })
      ).toBe('en');
    });

    test('wins over an English browser language', () => {
      expect(
        detect({ languages: ['en-US'], storage: memoryStorage({ [STORAGE_KEY]: 'es' }) })
      ).toBe('es');
    });

    test('is ignored when it is not a supported language', () => {
      expect(
        detect({ languages: ['es'], storage: memoryStorage({ [STORAGE_KEY]: 'fr' }) })
      ).toBe('es');
    });
  });

  describe('the browser languages', () => {
    test('Spanish first gives Spanish', () => {
      expect(detect({ languages: ['es-MX', 'en-US'] })).toBe('es');
    });

    test('English first gives English', () => {
      expect(detect({ languages: ['en-GB', 'es'] })).toBe('en');
    });

    test('skips languages the site does not have until it finds one it does', () => {
      expect(detect({ languages: ['fr-FR', 'de', 'es-AR', 'en'] })).toBe('es');
      expect(detect({ languages: ['pt-BR', 'en'] })).toBe('en');
    });

    test('reads the language case-insensitively and with underscores', () => {
      expect(detect({ languages: ['ES_es'] })).toBe('es');
      expect(detect({ languages: ['EN-us'] })).toBe('en');
    });

    test('a Spanish language wins over a Spanish-speaking time zone that says otherwise', () => {
      expect(detect({ languages: ['en'], timeZone: 'America/Lima' })).toBe('en');
    });
  });

  describe('neither Spanish nor English in the languages', () => {
    test('a Spanish-speaking region subtag gives Spanish', () => {
      expect(detect({ languages: ['gl-ES'] })).toBe('es');
      expect(detect({ languages: ['fr-MX'] })).toBe('es');
    });

    test('another region subtag gives English, even in a Spanish-speaking time zone', () => {
      expect(detect({ languages: ['fr-FR'], timeZone: 'America/Lima' })).toBe('en');
    });

    test('a Spanish-speaking time zone gives Spanish when no locale has a region', () => {
      expect(detect({ languages: ['fr'], timeZone: 'America/Bogota' })).toBe('es');
      expect(detect({ languages: [], timeZone: 'Europe/Madrid' })).toBe('es');
      expect(detect({ languages: [], timeZone: 'America/Argentina/Cordoba' })).toBe('es');
    });

    test('a time zone of another country gives English', () => {
      expect(detect({ languages: ['de'], timeZone: 'Europe/Berlin' })).toBe('en');
      expect(detect({ languages: [], timeZone: 'America/Sao_Paulo' })).toBe('en');
    });
  });

  describe('nothing to go on', () => {
    test('gives English', () => {
      expect(detect({ languages: [], timeZone: null, storage: null })).toBe('en');
    });

    test('gives English for an unknown time zone', () => {
      expect(detect({ languages: [], timeZone: 'Nowhere/Land' })).toBe('en');
    });
  });

  describe('blocked storage', () => {
    test('falls back to the detection from the languages', () => {
      expect(detect({ languages: ['es-ES'], storage: blockedStorage })).toBe('es');
      expect(detect({ languages: ['en-US'], storage: blockedStorage })).toBe('en');
    });

    test('falls back to the time zone and then to English', () => {
      expect(detect({ timeZone: 'America/Mexico_City', storage: blockedStorage })).toBe('es');
      expect(detect({ storage: blockedStorage })).toBe('en');
    });
  });
});

describe('storing the choice', () => {
  test('storeLanguage saves it where readStoredLanguage finds it', () => {
    const storage = memoryStorage();
    expect(storeLanguage('en', storage)).toBe(true);
    expect(readStoredLanguage(storage)).toBe('en');
  });

  test('storeLanguage reports a blocked storage instead of throwing', () => {
    expect(storeLanguage('es', blockedStorage)).toBe(false);
  });

  test('readStoredLanguage is null without a storage', () => {
    expect(readStoredLanguage(null)).toBeNull();
  });
});
