import { useState } from 'react';

const MENU_KEY = 'pysa:menu';

// Every storage access is wrapped: blocked storage (private windows, site data
// disabled) must leave the menu visible instead of crashing the app.
function readHidden() {
  try {
    return window.localStorage.getItem(MENU_KEY) === 'hidden';
  } catch {
    return false;
  }
}

function writeHidden(hidden) {
  try {
    window.localStorage.setItem(MENU_KEY, hidden ? 'hidden' : 'visible');
  } catch {
    // The choice just won't be remembered.
  }
}

// Whether the desktop visitor hid the left menu, remembered between visits.
export function useMenuHidden() {
  const [hidden, setHidden] = useState(readHidden);

  function setMenuHidden(value) {
    setHidden(value);
    writeHidden(value);
  }

  return [hidden, setMenuHidden];
}
