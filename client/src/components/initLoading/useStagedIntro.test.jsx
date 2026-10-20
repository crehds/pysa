import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { MotionProvider } from '../../motion/MotionContext';
import { INTRO_STORAGE_KEY, hasIntroPlayed } from './introMarker';
import { INTRO_TIMING, useStagedIntro } from './useStagedIntro';

function wrapper({ children }) {
  return <MotionProvider>{children}</MotionProvider>;
}

function setLevel(level) {
  if (level === 'none') {
    window.matchMedia = vi.fn(() => ({ matches: true }));
  } else if (level === 'lite') {
    Object.defineProperty(navigator, 'connection', {
      value: { effectiveType: '3g' },
      configurable: true,
    });
  }
}

function renderIntro(props = {}) {
  return renderHook((state) => useStagedIntro(state), {
    wrapper,
    initialProps: { ready: false, failed: false, ...props },
  });
}

const advance = (ms) => act(() => vi.advanceTimersByTime(ms));

describe('useStagedIntro', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.sessionStorage.removeItem(INTRO_STORAGE_KEY);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    delete window.matchMedia;
    delete navigator.connection;
  });

  test('the timings are named: about 2.5 s in full, about 1.2 s in lite', () => {
    expect(INTRO_TIMING.full).toEqual({ minMs: 2000, curtainMs: 500 });
    expect(INTRO_TIMING.lite).toEqual({ minMs: 800, curtainMs: 400 });
  });

  test('plays on the first load in a tab and marks the tab', () => {
    const { result } = renderIntro();
    expect(result.current.active).toBe(true);
    expect(result.current.curtain).toBe(false);
    expect(hasIntroPlayed()).toBe(true);
  });

  test('full: data that arrive early still wait for the minimum, then the curtain', () => {
    const { result } = renderIntro({ ready: true });
    advance(1999);
    expect(result.current.curtain).toBe(false);
    advance(1);
    expect(result.current.curtain).toBe(true);
    expect(result.current.active).toBe(true);
    advance(499);
    expect(result.current.active).toBe(true);
    advance(1);
    expect(result.current.active).toBe(false);
  });

  test('lite: a shorter minimum and curtain', () => {
    setLevel('lite');
    const { result } = renderIntro({ ready: true });
    advance(799);
    expect(result.current.curtain).toBe(false);
    advance(1);
    expect(result.current.curtain).toBe(true);
    advance(400);
    expect(result.current.active).toBe(false);
  });

  test('late data keep the intro going until they land, then the curtain opens', () => {
    const { result, rerender } = renderIntro();
    advance(10_000);
    expect(result.current.active).toBe(true);
    expect(result.current.curtain).toBe(false);

    rerender({ ready: true, failed: false });
    expect(result.current.curtain).toBe(true);
    advance(500);
    expect(result.current.active).toBe(false);
  });

  test('a failed load ends the intro right away, with no curtain', () => {
    const { result, rerender } = renderIntro();
    rerender({ ready: false, failed: true });
    expect(result.current.active).toBe(false);
    expect(result.current.curtain).toBe(false);

    // A retry is not a first load: the intro does not come back.
    rerender({ ready: false, failed: false });
    expect(result.current.active).toBe(false);
  });

  test('skipping with the data ready ends the intro at once', () => {
    const { result } = renderIntro({ ready: true });
    act(() => result.current.skip());
    expect(result.current.active).toBe(false);
  });

  test('skipping before the data land ends the intro and does not come back', () => {
    const { result, rerender } = renderIntro();
    act(() => result.current.skip());
    expect(result.current.active).toBe(false);
    rerender({ ready: true, failed: false });
    advance(5000);
    expect(result.current.active).toBe(false);
    expect(result.current.curtain).toBe(false);
  });

  test('a tab that already played it gets no intro', () => {
    window.sessionStorage.setItem(INTRO_STORAGE_KEY, '1');
    const { result } = renderIntro();
    expect(result.current.active).toBe(false);
  });

  test('reduced motion (none) never shows the intro and never marks the tab', () => {
    setLevel('none');
    const { result } = renderIntro();
    expect(result.current.active).toBe(false);
    expect(hasIntroPlayed()).toBe(false);
  });

  test('blocked storage still shows the intro', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const { result } = renderIntro({ ready: true });
    expect(result.current.active).toBe(true);
    advance(2000);
    advance(500);
    expect(result.current.active).toBe(false);
  });
});
