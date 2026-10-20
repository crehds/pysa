import { css, keyframes } from 'styled-components';
import { metalColors } from './podium';

// Motion of the podium cards, shared by the Home podium and the Players top 3.
// Everything that moves is opacity or transform, so it stays on the compositor.
export const PODIUM_MOTION = {
  entranceMs: 550, // one card rising in (full)
  staggerMs: 250, // gap between two cards (full): 3rd, 2nd, 1st in under 1.5 s
  fadeMs: 300, // the short fade of lite
  glowCycleMs: 1100, // one pulse of the glow
  glowPulses: 2, // two pulses, then lit for good (under 5 s: WCAG 2.2.2)
};

// How a card comes in. Full: the cards rise one after another in the order of
// an award ceremony (3rd first, 1st last); lite: all at once with a short fade;
// none: null (static). `rank` is 1-based and `count` is how many cards there are.
export function entranceFor(level, rank, count) {
  if (level === 'full') {
    return {
      kind: 'rise',
      delayMs: (count - rank) * PODIUM_MOTION.staggerMs,
      durationMs: PODIUM_MOTION.entranceMs,
    };
  }
  if (level === 'lite') return { kind: 'fade', delayMs: 0, durationMs: PODIUM_MOTION.fadeMs };
  return null;
}

// The glow's pulse. Only full pulses (after `delayMs`); lite and none keep the
// glow lit and still, which is not motion.
export function glowFor(level, delayMs = 0) {
  if (level !== 'full') return null;
  return { delayMs, cycleMs: PODIUM_MOTION.glowCycleMs, pulses: PODIUM_MOTION.glowPulses };
}

const rise = keyframes`
  from { opacity: 0; transform: translateY(var(--space-4)); }
  to { opacity: 1; transform: none; }
`;

const fade = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const GLOW_LIT = 0.6;

// Dim, then bright, then back to the lit resting level.
const glowPulse = keyframes`
  from { opacity: 0.15; }
  50% { opacity: 1; }
  to { opacity: ${GLOW_LIT}; }
`;

// `backwards` holds the first frame during the delay and lets go at the end, so
// the resting styles (and a later hover transform) apply again.
export const entranceCss = (entrance) =>
  entrance &&
  css`
    animation: ${entrance.kind === 'rise' ? rise : fade} ${entrance.durationMs}ms ease-out
      ${entrance.delayMs}ms backwards;
  `;

// A metal glow around a top-3 card: a pseudo-element just outside the border
// whose opacity (never the shadow itself) is what pulses. It draws nothing
// inside the card and sits far below the intro's z-index. Pass the rank, and
// `$glow` (from glowFor) to pulse it.
export const topGlowCss = ({ $rank, $glow }) =>
  metalColors[$rank] &&
  css`
    position: relative;

    &::after {
      content: '';
      position: absolute;
      inset: calc(-1 * var(--space-1)) -1px -1px;
      border-radius: inherit;
      box-shadow: 0 0 var(--space-6) ${metalColors[$rank]};
      opacity: ${GLOW_LIT};
      pointer-events: none;
      ${$glow &&
      css`
        animation: ${glowPulse} ${$glow.cycleMs}ms ease-in-out ${$glow.delayMs}ms
          ${$glow.pulses} backwards;
      `}
    }
  `;
