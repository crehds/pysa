import { INTRO_STORAGE_KEY, hasIntroPlayed, markIntroPlayed } from './introMarker';

describe('the intro marker', () => {
  beforeEach(() => window.sessionStorage.removeItem(INTRO_STORAGE_KEY));
  afterEach(() => vi.restoreAllMocks());

  test('is unset in a fresh tab, and set once the intro is marked', () => {
    expect(hasIntroPlayed()).toBe(false);
    markIntroPlayed();
    expect(hasIntroPlayed()).toBe(true);
  });

  test('reads as not played when the storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(hasIntroPlayed()).toBe(false);
  });

  test('marking never throws when the storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(() => markIntroPlayed()).not.toThrow();
  });

  test('reads as not played when there is no sessionStorage at all', () => {
    vi.spyOn(window, 'sessionStorage', 'get').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(hasIntroPlayed()).toBe(false);
    expect(() => markIntroPlayed()).not.toThrow();
  });
});
