import {
  detectMotionLevel,
  readConnection,
  readPrefersReducedMotion,
} from './detectMotionLevel';

describe('detectMotionLevel', () => {
  test('reduced motion means none, whatever the connection is', () => {
    expect(detectMotionLevel({ prefersReducedMotion: true, connection: { effectiveType: '4g' } })).toBe('none');
    expect(detectMotionLevel({ prefersReducedMotion: true, connection: { saveData: true } })).toBe('none');
  });

  test('Save-Data means lite', () => {
    expect(detectMotionLevel({ prefersReducedMotion: false, connection: { saveData: true, effectiveType: '4g' } })).toBe('lite');
  });

  test.each(['slow-2g', '2g', '3g'])('a %s connection means lite', (effectiveType) => {
    expect(detectMotionLevel({ prefersReducedMotion: false, connection: { effectiveType } })).toBe('lite');
  });

  test('a 4g connection means full', () => {
    expect(detectMotionLevel({ prefersReducedMotion: false, connection: { saveData: false, effectiveType: '4g' } })).toBe('full');
  });

  test('a browser without the Network Information API means full', () => {
    expect(detectMotionLevel({ prefersReducedMotion: false, connection: null })).toBe('full');
    expect(detectMotionLevel({ prefersReducedMotion: false, connection: undefined })).toBe('full');
  });

  test('inputs left out are read from the browser; jsdom has neither, so full', () => {
    expect(detectMotionLevel()).toBe('full');
  });
});

describe('default readers', () => {
  afterEach(() => {
    delete window.matchMedia;
    delete navigator.connection;
  });

  test('without matchMedia nothing is reduced', () => {
    expect(readPrefersReducedMotion()).toBe(false);
  });

  test('reads the reduced-motion query', () => {
    window.matchMedia = vi.fn(() => ({ matches: true }));
    expect(readPrefersReducedMotion()).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
  });

  test('a matchMedia that throws counts as not reduced', () => {
    window.matchMedia = () => {
      throw new Error('blocked');
    };
    expect(readPrefersReducedMotion()).toBe(false);
  });

  test('reads navigator.connection, or null when missing', () => {
    expect(readConnection()).toBeNull();
    const connection = { effectiveType: '2g' };
    Object.defineProperty(navigator, 'connection', { value: connection, configurable: true });
    expect(readConnection()).toBe(connection);
  });

  test('a connection getter that throws counts as missing', () => {
    Object.defineProperty(navigator, 'connection', {
      get() {
        throw new Error('blocked');
      },
      configurable: true,
    });
    expect(readConnection()).toBeNull();
  });
});
