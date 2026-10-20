// jest-dom adds custom matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest';
import { INTRO_STORAGE_KEY } from './components/initLoading/introMarker';

// The site picks its language from the visitor's browser. jsdom reports
// English, so pin Spanish here for deterministic tests (the copy most suites
// assert); a test that needs another language sets navigator.languages itself.
// Only LanguageProvider reads navigator.languages. A component rendered
// outside it falls back to English (see LanguageContext.jsx), so such a test
// must expect English text (LanguageContext.test.jsx covers this).
// Each test starts with no stored language choice and the Spanish default.
//
// The staged intro plays on the first load in a tab, so the marker is already
// set: every test sees the fast loader, as a refresh would. The intro's own
// tests remove the marker.
beforeEach(() => {
  Object.defineProperty(window.navigator, 'languages', {
    value: ['es-ES', 'es'],
    configurable: true,
  });
  try {
    window.sessionStorage.setItem(INTRO_STORAGE_KEY, '1');
  } catch {
    // Some tests replace or block the storage on purpose.
  }
});

afterEach(() => {
  try {
    window.localStorage.clear();
  } catch {
    // Some tests replace or block the storage on purpose.
  }
  try {
    window.sessionStorage.clear();
  } catch {
    // Same as above.
  }
  document.documentElement.removeAttribute('lang');
});
