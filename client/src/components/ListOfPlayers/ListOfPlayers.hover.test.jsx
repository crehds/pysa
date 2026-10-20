import React from 'react';
import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '../../i18n/LanguageContext';
import { MotionProvider } from '../../motion/MotionContext';
import { ListOfPlayers } from '.';

const PLAYERS = ['Uno', 'Dos'].map((nickname, i) => ({
  _id: String(i),
  nickname,
  medail: 'm',
  mmr: 1000 - i,
  imgURL: '/default/default-user.png',
  rolesScore: [],
  partidas: 0,
  kda: 0,
}));

const HOVER_QUERY = '(hover: hover) and (pointer: fine)';

// The rules written for the grid, with the media query each one sits in.
function gridRules() {
  const grid = screen.getByRole('list');
  const classes = [...grid.classList];
  return [...document.styleSheets]
    .flatMap((sheet) => [...sheet.cssRules])
    .flatMap((rule) =>
      rule.media
        ? [...rule.cssRules].map((inner) => ({ media: rule.media.mediaText, rule: inner }))
        : [{ media: null, rule }]
    )
    .filter(({ rule }) => classes.some((name) => rule.selectorText?.includes(`.${name}`)))
    .map(({ media, rule }) => ({ media, selector: rule.selectorText, style: rule.style }));
}

const receding = (rules) =>
  rules.find(
    (r) => r.selector.includes(':has(> li:hover)') && r.selector.includes('li:not(:hover)')
  );

function renderGrid() {
  render(
    <LanguageProvider>
      <MotionProvider>
        <ListOfPlayers players={PLAYERS} />
      </MotionProvider>
    </LanguageProvider>
  );
  return gridRules();
}

describe('Players grid spotlight', () => {
  afterEach(() => {
    delete window.matchMedia;
    delete navigator.connection;
  });

  test('full: while a card is hovered the others recede a little', () => {
    const rule = receding(renderGrid());
    expect(rule.media).toBe(HOVER_QUERY);
    expect(rule.selector).toMatch(/>\s*li:not\(:hover\)\s*>\s*article$/);
    expect(rule.style.getPropertyValue('opacity')).toBe('0.75');
    expect(rule.style.getPropertyValue('transform')).toBe('scale(0.98)');
  });

  test('lite: the same as full', () => {
    Object.defineProperty(navigator, 'connection', {
      value: { effectiveType: '3g' },
      configurable: true,
    });
    const rule = receding(renderGrid());
    expect(rule.style.getPropertyValue('opacity')).toBe('0.75');
    expect(rule.style.getPropertyValue('transform')).toBe('scale(0.98)');
  });

  test('none: the others only dim, with no transform', () => {
    window.matchMedia = vi.fn(() => ({ matches: true }));
    const rule = receding(renderGrid());
    expect(rule.style.getPropertyValue('opacity')).toBe('0.75');
    expect(rule.style.getPropertyValue('transform')).toBe('');
  });

  test('no rule of the grid reacts to hover outside the media query', () => {
    renderGrid()
      .filter((r) => r.selector.includes(':hover'))
      .forEach((r) => expect(r.media).toBe(HOVER_QUERY));
  });
});
