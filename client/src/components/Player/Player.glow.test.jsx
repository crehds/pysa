import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { MotionProvider } from '../../motion/MotionContext';
import { Player } from '.';

const PLAYER = {
  nickname: 'Cuatro',
  medail: 'm',
  mmr: 1000,
  imgURL: '/default/default-user.png',
  rolesScore: [],
  partidas: 0,
  kda: 0,
};

function glowRule(element) {
  const classes = [...element.classList];
  return [...document.styleSheets]
    .flatMap((sheet) => [...sheet.cssRules])
    .find(
      (rule) =>
        rule.selectorText?.includes('::after') &&
        classes.some((name) => rule.selectorText.includes(`.${name}`))
    );
}

function fakeEmitter(initial) {
  const listeners = new Set();
  return {
    ...initial,
    addEventListener: (type, fn) => type === 'change' && listeners.add(fn),
    removeEventListener: (type, fn) => type === 'change' && listeners.delete(fn),
    emit: () => listeners.forEach((fn) => fn()),
  };
}

function renderPlayer(rank) {
  render(
    <LanguageProvider>
      <MotionProvider>
        <Player {...PLAYER} rank={rank} />
      </MotionProvider>
    </LanguageProvider>
  );
  return screen.getByRole('article');
}

describe('Player card glow', () => {
  afterEach(() => {
    delete window.matchMedia;
    delete navigator.connection;
  });

  test('full: a top-3 card pulses twice', () => {
    const rule = glowRule(renderPlayer(2));
    expect(rule.style.getPropertyValue('animation')).toMatch(
      /1100ms ease-in-out 0ms 2 backwards/
    );
  });

  test('lite: a top-3 card is lit and still', () => {
    Object.defineProperty(navigator, 'connection', {
      value: { effectiveType: '3g' },
      configurable: true,
    });
    const rule = glowRule(renderPlayer(1));
    expect(rule).toBeDefined();
    expect(rule.style.getPropertyValue('animation')).toBe('');
  });

  test('none: a top-3 card is lit and still', () => {
    window.matchMedia = vi.fn(() => ({ matches: true }));
    const rule = glowRule(renderPlayer(3));
    expect(rule).toBeDefined();
    expect(rule.style.getPropertyValue('animation')).toBe('');
  });

  test('a lite to full change after mount does not start the pulse', () => {
    const connection = fakeEmitter({ effectiveType: '3g' });
    Object.defineProperty(navigator, 'connection', { value: connection, configurable: true });
    const card = renderPlayer(1);
    expect(glowRule(card).style.getPropertyValue('animation')).toBe('');

    connection.effectiveType = '4g';
    act(() => connection.emit());
    expect(glowRule(card).style.getPropertyValue('animation')).toBe('');
  });

  test('a full to lite change after mount keeps the pulse as it was', () => {
    const connection = fakeEmitter({ effectiveType: '4g' });
    Object.defineProperty(navigator, 'connection', { value: connection, configurable: true });
    const card = renderPlayer(2);
    const pulse = glowRule(card).style.getPropertyValue('animation');
    expect(pulse).toMatch(/2 backwards/);

    connection.effectiveType = '3g';
    act(() => connection.emit());
    expect(glowRule(card).style.getPropertyValue('animation')).toBe(pulse);
  });

  test('a flip to none after mount stops the pulse', () => {
    const query = fakeEmitter({ matches: false });
    window.matchMedia = vi.fn(() => query);
    const card = renderPlayer(3);
    expect(glowRule(card).style.getPropertyValue('animation')).toMatch(/2 backwards/);

    query.matches = true;
    act(() => query.emit());
    expect(glowRule(card).style.getPropertyValue('animation')).toBe('');
  });

  test('a card outside the top 3 has no glow', () => {
    expect(glowRule(renderPlayer(4))).toBeUndefined();
  });
});
