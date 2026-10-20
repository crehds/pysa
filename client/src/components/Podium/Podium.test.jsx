import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { MotionProvider } from '../../motion/MotionContext';
import { Podium } from '.';

const PLAYERS = [
  { _id: 'a', nickname: 'Uno', medail: 'm', mmr: 3000 },
  { _id: 'b', nickname: 'Dos', medail: 'm', mmr: 2000 },
  { _id: 'c', nickname: 'Tres', medail: 'm', mmr: 1000 },
];

function setLevel(level) {
  if (level === 'none') window.matchMedia = vi.fn(() => ({ matches: true }));
  if (level === 'lite') {
    Object.defineProperty(navigator, 'connection', {
      value: { effectiveType: '3g' },
      configurable: true,
    });
  }
}

// The CSS rules styled-components wrote for an element (jsdom does not run
// animations, but it keeps the stylesheet text).
function rulesOf(element) {
  const classes = [...element.classList];
  return [...document.styleSheets]
    .flatMap((sheet) => [...sheet.cssRules])
    .filter((rule) => classes.some((name) => rule.selectorText?.includes(`.${name}`)));
}

// The animation shorthand of the card itself or of its ::after, or null.
function animationOf(element, pseudo = false) {
  const rule = rulesOf(element).find((r) => r.selectorText.includes('::after') === pseudo);
  return rule?.style.getPropertyValue('animation') || null;
}

// A minimal MediaQueryList / NetworkInformation whose change can be emitted.
function fakeEmitter(initial) {
  const listeners = new Set();
  return {
    ...initial,
    addEventListener: (type, fn) => type === 'change' && listeners.add(fn),
    removeEventListener: (type, fn) => type === 'change' && listeners.delete(fn),
    emit: () => listeners.forEach((fn) => fn()),
  };
}

const hasGlow = (element) => rulesOf(element).some((r) => r.selectorText.includes('::after'));
const card = (name) => screen.getByText(name).closest('li');

function renderPodium() {
  return render(
    <LanguageProvider>
      <MotionProvider>
        <Podium players={PLAYERS} />
      </MotionProvider>
    </LanguageProvider>
  );
}

describe('Podium motion', () => {
  afterEach(() => {
    delete window.matchMedia;
    delete navigator.connection;
  });

  test('full: the cards rise in the order 3rd, 2nd, 1st', () => {
    renderPodium();
    expect(animationOf(card('Tres'))).toMatch(/550ms ease-out 0ms backwards/);
    expect(animationOf(card('Dos'))).toMatch(/550ms ease-out 250ms backwards/);
    expect(animationOf(card('Uno'))).toMatch(/550ms ease-out 500ms backwards/);
  });

  test('full: the glow pulses twice, once the card is in', () => {
    renderPodium();
    // The 1st place card is in at 500 + 550 ms.
    expect(animationOf(card('Uno'), true)).toMatch(/1100ms ease-in-out 1050ms 2 backwards/);
    expect(animationOf(card('Tres'), true)).toMatch(/1100ms ease-in-out 550ms 2 backwards/);
  });

  test('lite: one short fade for all, and a steady glow', () => {
    setLevel('lite');
    renderPodium();
    ['Uno', 'Dos', 'Tres'].forEach((name) => {
      expect(animationOf(card(name))).toMatch(/300ms ease-out 0ms backwards/);
      expect(hasGlow(card(name))).toBe(true);
      expect(animationOf(card(name), true)).toBeNull();
    });
  });

  test('none: no animation at all, the glow still lit', () => {
    setLevel('none');
    renderPodium();
    ['Uno', 'Dos', 'Tres'].forEach((name) => {
      expect(animationOf(card(name))).toBeNull();
      expect(hasGlow(card(name))).toBe(true);
      expect(animationOf(card(name), true)).toBeNull();
    });
  });

  test('a lite to full change after mount does not replay the entrance or the pulse', () => {
    const connection = fakeEmitter({ effectiveType: '3g' });
    Object.defineProperty(navigator, 'connection', { value: connection, configurable: true });
    renderPodium();
    const entrance = animationOf(card('Uno'));
    expect(entrance).toMatch(/300ms ease-out 0ms backwards/);

    connection.effectiveType = '4g';
    act(() => connection.emit());
    expect(animationOf(card('Uno'))).toBe(entrance);
    expect(animationOf(card('Uno'), true)).toBeNull();
  });

  test('a full to lite change after mount keeps the entrance and the pulse as they were', () => {
    const connection = fakeEmitter({ effectiveType: '4g' });
    Object.defineProperty(navigator, 'connection', { value: connection, configurable: true });
    renderPodium();
    const entrance = animationOf(card('Uno'));
    const glow = animationOf(card('Uno'), true);
    expect(glow).toMatch(/2 backwards/);

    connection.effectiveType = '3g';
    act(() => connection.emit());
    expect(animationOf(card('Uno'))).toBe(entrance);
    expect(animationOf(card('Uno'), true)).toBe(glow);
  });

  test('a flip to none after mount stops the motion, and it stays stopped', () => {
    const query = fakeEmitter({ matches: false });
    window.matchMedia = vi.fn(() => query);
    renderPodium();
    expect(animationOf(card('Uno'))).not.toBeNull();

    query.matches = true;
    act(() => query.emit());
    ['Uno', 'Dos', 'Tres'].forEach((name) => {
      expect(animationOf(card(name))).toBeNull();
      expect(animationOf(card(name), true)).toBeNull();
    });

    // Back to full: no replay.
    query.matches = false;
    act(() => query.emit());
    expect(animationOf(card('Uno'))).toBeNull();
    expect(animationOf(card('Uno'), true)).toBeNull();
  });

  test('the visible rank stays the cue, whatever the motion', () => {
    renderPodium();
    expect(card('Uno')).toHaveTextContent(/^1/);
  });
});
