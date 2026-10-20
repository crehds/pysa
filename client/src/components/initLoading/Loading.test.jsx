import React from 'react';
import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { MotionProvider } from '../../motion/MotionContext';
import { Loading } from '.';

// The animation shorthand styled-components wrote for the logo (jsdom runs no
// animations, but it keeps the stylesheet text).
function logoAnimation() {
  const logo = screen.getByRole('status').querySelector('img');
  const classes = [...logo.classList];
  const rule = [...document.styleSheets]
    .flatMap((sheet) => [...sheet.cssRules])
    .find((r) => classes.some((name) => r.selectorText?.includes(`.${name}`)));
  return rule?.style.getPropertyValue('animation') || null;
}

function renderLoading() {
  render(
    <LanguageProvider>
      <MotionProvider>
        <Loading />
      </MotionProvider>
    </LanguageProvider>
  );
}

// The loader's pulse is functional "loading" feedback, so lite keeps it; only
// none is still.
describe('the fast loader', () => {
  afterEach(() => {
    delete window.matchMedia;
    delete navigator.connection;
  });

  test('full: the logo pulses', () => {
    renderLoading();
    expect(logoAnimation()).toMatch(/0\.9s ease-in-out infinite alternate/);
  });

  test('lite: the logo still pulses', () => {
    Object.defineProperty(navigator, 'connection', {
      value: { effectiveType: '3g' },
      configurable: true,
    });
    renderLoading();
    expect(logoAnimation()).toMatch(/infinite/);
  });

  test('none: the logo is still', () => {
    window.matchMedia = vi.fn(() => ({ matches: true }));
    renderLoading();
    expect(logoAnimation()).toBeNull();
  });
});
