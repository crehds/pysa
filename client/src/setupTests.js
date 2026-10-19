// jest-dom adds custom matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest';

// The site picks its language from the visitor's browser. jsdom reports
// English, so pin Spanish here for deterministic tests (the copy most suites
// assert); a test that needs another language sets navigator.languages itself.
// Only LanguageProvider reads navigator.languages. A component rendered
// outside it falls back to English (see LanguageContext.jsx), so such a test
// must expect English text (LanguageContext.test.jsx covers this).
// Each test starts with no stored language choice and the Spanish default.
beforeEach(() => {
  Object.defineProperty(window.navigator, 'languages', {
    value: ['es-ES', 'es'],
    configurable: true,
  });
});

afterEach(() => {
  try {
    window.localStorage.clear();
  } catch {
    // Some tests replace or block the storage on purpose.
  }
  document.documentElement.removeAttribute('lang');
});
