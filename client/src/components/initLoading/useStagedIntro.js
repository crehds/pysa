import { useCallback, useEffect, useState } from 'react';
import { useMotionLevel } from '../../motion/MotionContext';
import { hasIntroPlayed, markIntroPlayed } from './introMarker';

// How long the intro is forced to show (minMs) and how long the curtain takes
// to open (curtainMs): about 2.5 s in full, about 1.2 s in lite.
export const INTRO_TIMING = {
  full: { minMs: 2000, curtainMs: 500 },
  lite: { minMs: 800, curtainMs: 400 },
};

// Drives the staged intro. Phases: 'playing' (the minimum show time, then as
// long as the data take), 'curtain' (the curtain opens on the loaded page) and
// 'done'. Only the first load in a tab and a level other than 'none' start at
// 'playing'; everything else starts at 'done' and gets the fast loader.
//
//   ready  the data have landed
//   failed the request failed: the intro ends at once, with no curtain
//
// The intro's timing and look are frozen at the level it started with: a live
// full <-> lite change does not restart its clock. Only a flip to 'none' (the
// visitor asked for reduced motion) ends it early.
//
// Returns { active, curtain, skip, level }. `active` is true while the intro is
// on screen, `curtain` during the last phase, `level` the frozen level. Skipping ends the intro right away:
// with the data ready the page shows, otherwise the fast loader does until they
// land.
export function useStagedIntro({ ready, failed }) {
  const currentLevel = useMotionLevel();
  const [level] = useState(() => (currentLevel === 'none' ? 'lite' : currentLevel));
  const [phase, setPhase] = useState(() =>
    currentLevel !== 'none' && !hasIntroPlayed() ? 'playing' : 'done'
  );
  const [minElapsed, setMinElapsed] = useState(false);
  const { minMs, curtainMs } = INTRO_TIMING[level] ?? INTRO_TIMING.lite;

  useEffect(() => {
    if (phase === 'playing') markIntroPlayed();
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing') return undefined;
    const id = setTimeout(() => setMinElapsed(true), minMs);
    return () => clearTimeout(id);
  }, [phase, minMs]);

  useEffect(() => {
    if (phase === 'playing' && minElapsed && ready) setPhase('curtain');
  }, [phase, minElapsed, ready]);

  useEffect(() => {
    if (phase !== 'curtain') return undefined;
    const id = setTimeout(() => setPhase('done'), curtainMs);
    return () => clearTimeout(id);
  }, [phase, curtainMs]);

  // A failure, or the visitor asking for reduced motion mid-intro, ends it.
  useEffect(() => {
    if (failed || currentLevel === 'none') setPhase('done');
  }, [failed, currentLevel]);

  const skip = useCallback(() => setPhase('done'), []);

  return {
    active: phase !== 'done' && !failed && currentLevel !== 'none',
    curtain: phase === 'curtain',
    skip,
    level,
  };
}
