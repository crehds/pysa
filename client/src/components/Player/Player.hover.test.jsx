import React from 'react';
import { render, screen } from '@testing-library/react';
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

const HOVER_QUERY = '(hover: hover) and (pointer: fine)';

// Every CSS rule written for the card, with the media query it sits in (jsdom
// runs no hover, but it keeps the stylesheet text).
function rulesOf(element) {
  const classes = [...element.classList];
  const mine = (rule) => classes.some((name) => rule.selectorText?.includes(`.${name}`));
  return [...document.styleSheets]
    .flatMap((sheet) => [...sheet.cssRules])
    .flatMap((rule) =>
      rule.media
        ? [...rule.cssRules].map((inner) => ({ media: rule.media.mediaText, rule: inner }))
        : [{ media: null, rule }]
    )
    .filter(({ rule }) => mine(rule))
    .map(({ media, rule }) => ({ media, selector: rule.selectorText, style: rule.style }));
}

const find = (rules, selector) => rules.find((r) => r.selector.endsWith(selector));

function renderPlayer(rank = 4) {
  render(
    <LanguageProvider>
      <MotionProvider>
        <Player {...PLAYER} rank={rank} />
      </MotionProvider>
    </LanguageProvider>
  );
  return screen.getByRole('article');
}

describe('Player card hover spotlight', () => {
  afterEach(() => {
    delete window.matchMedia;
    delete navigator.connection;
  });

  test('full: the hovered card lifts, only for a fine hovering pointer', () => {
    const rules = rulesOf(renderPlayer());
    const hover = find(rules, ':hover');
    expect(hover.media).toBe(HOVER_QUERY);
    expect(hover.style.getPropertyValue('transform')).toBe('translateY(-4px) scale(1.02)');
    expect(hover.style.getPropertyValue('z-index')).toBe('1');
    // No hover rule leaks outside the media query.
    rules
      .filter((r) => r.selector.includes(':hover'))
      .forEach((r) => expect(r.media).toBe(HOVER_QUERY));
  });

  test('the card is positioned and animates only transform and opacity', () => {
    const rules = rulesOf(renderPlayer());
    const base = rules.find((r) => r.media === HOVER_QUERY && !r.selector.includes(':'));
    expect(base.style.getPropertyValue('position')).toBe('relative');
    const transition = base.style.getPropertyValue('transition');
    expect(transition).toMatch(/transform 200ms/);
    expect(transition).toMatch(/opacity 200ms/);
    expect(transition).not.toMatch(/shadow/);
  });

  test('the highlight is a ::before whose opacity fades in on hover', () => {
    const rules = rulesOf(renderPlayer());
    const before = rules.find((r) => r.selector.endsWith('::before'));
    expect(before.media).toBe(HOVER_QUERY);
    expect(before.style.getPropertyValue('opacity')).toBe('0');
    expect(before.style.getPropertyValue('pointer-events')).toBe('none');
    expect(before.style.getPropertyValue('transition')).toMatch(/opacity 200ms/);
    const lit = find(rules, ':hover::before');
    expect(lit.style.getPropertyValue('opacity')).toBe('1');
  });

  test('lite: the same lift as full', () => {
    Object.defineProperty(navigator, 'connection', {
      value: { effectiveType: '3g' },
      configurable: true,
    });
    const hover = find(rulesOf(renderPlayer()), ':hover');
    expect(hover.style.getPropertyValue('transform')).toBe('translateY(-4px) scale(1.02)');
  });

  test('none: the highlight stays, but nothing moves', () => {
    window.matchMedia = vi.fn(() => ({ matches: true }));
    const rules = rulesOf(renderPlayer());
    const hover = find(rules, ':hover');
    expect(hover.style.getPropertyValue('transform')).toBe('');
    expect(find(rules, ':hover::before').style.getPropertyValue('opacity')).toBe('1');
  });

  test('a top-3 card keeps its glow: the highlight never touches ::after', () => {
    const rules = rulesOf(renderPlayer(1));
    expect(rules.some((r) => r.selector.endsWith('::after'))).toBe(true);
    expect(rules.filter((r) => r.selector.includes(':hover::after'))).toEqual([]);
  });
});
