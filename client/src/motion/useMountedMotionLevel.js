import { useState } from 'react';
import { useMotionLevel } from './MotionContext';

// The motion level a one-shot effect started with. A later change of the live
// level (a connection going 4g <-> 3g) must not rebuild the animation and replay
// it, so the level is frozen at mount. The one exception is 'none': once the
// visitor asks for reduced motion the effect stops and stays stopped.
export function useMountedMotionLevel() {
  const live = useMotionLevel();
  const [level, setLevel] = useState(live);
  if (live === 'none' && level !== 'none') setLevel('none');
  return level;
}
