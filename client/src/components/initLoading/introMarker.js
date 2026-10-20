// The staged intro plays once per tab. This marker lives in sessionStorage,
// which is per tab and survives a reload, so a refresh or F5 gets the fast
// loader. Storage can be missing or throw (private modes, blocked cookies):
// then the marker reads as unset and the intro plays.
export const INTRO_STORAGE_KEY = 'pysa:intro-played';

export function hasIntroPlayed() {
  try {
    return window.sessionStorage.getItem(INTRO_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export function markIntroPlayed() {
  try {
    window.sessionStorage.setItem(INTRO_STORAGE_KEY, '1');
  } catch {
    // Nothing to do: without storage the intro simply plays again next time.
  }
}
