// How much motion the site plays for a visitor. The rule, in order:
//   1. the system asks for reduced motion: 'none' (this wins over everything);
//   2. Save-Data is on, or the connection is slow (slow-2g, 2g, 3g): 'lite',
//      which has no loops, only one-shot effects;
//   3. otherwise 'full'. That includes every browser without the Network
//      Information API (Safari, Firefox) and one without matchMedia.

export const MOTION_LEVELS = ['none', 'lite', 'full'];
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const SLOW_CONNECTIONS = new Set(['slow-2g', '2g', '3g']);

// The reduced-motion MediaQueryList, or null where matchMedia is missing or
// blocked.
export function readReducedMotionQuery() {
  try {
    return typeof window.matchMedia === 'function'
      ? window.matchMedia(REDUCED_MOTION_QUERY)
      : null;
  } catch {
    return null;
  }
}

export function readPrefersReducedMotion() {
  return readReducedMotionQuery()?.matches === true;
}

// navigator.connection, or null where the API does not exist.
export function readConnection() {
  try {
    return 'connection' in navigator ? navigator.connection ?? null : null;
  } catch {
    return null;
  }
}

// Every input can be injected (for tests); one that is left out is read from the
// browser, and `null` means "not available".
export function detectMotionLevel({
  prefersReducedMotion = readPrefersReducedMotion(),
  connection = readConnection(),
} = {}) {
  if (prefersReducedMotion) return 'none';
  if (connection?.saveData === true || SLOW_CONNECTIONS.has(connection?.effectiveType)) {
    return 'lite';
  }
  return 'full';
}
