import React, { createContext, useContext, useEffect, useState } from 'react';
import { detectMotionLevel, readConnection, readReducedMotionQuery } from './detectMotionLevel';

// Without a provider (a component rendered on its own) the level is 'full'.
const MotionContext = createContext('full');

// Holds the current motion level: detected on load, kept live when the visitor
// changes the system setting or the connection changes, and mirrored into
// <html data-motion> so CSS can read it (`:root[data-motion='full'] &`).
export function MotionProvider({ children }) {
  const [level, setLevel] = useState(() => detectMotionLevel());

  useEffect(() => {
    const query = readReducedMotionQuery();
    const connection = readConnection();
    const update = () => setLevel(detectMotionLevel());

    update();
    query?.addEventListener?.('change', update);
    connection?.addEventListener?.('change', update);
    return () => {
      query?.removeEventListener?.('change', update);
      connection?.removeEventListener?.('change', update);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.motion = level;
    return () => {
      delete document.documentElement.dataset.motion;
    };
  }, [level]);

  return <MotionContext.Provider value={level}>{children}</MotionContext.Provider>;
}

export const useMotionLevel = () => useContext(MotionContext);
