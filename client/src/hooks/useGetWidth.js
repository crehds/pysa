import { useEffect, useState } from 'react';

// Width of the area the pages draw in: the <main> element when it is on the
// page (it is the full width on phones and the width next to the rail on
// wide screens), else the whole app.
function measureContentWidth() {
  return findContent().clientWidth;
}

function findContent() {
  return document.querySelector('main') || document.getElementById('app');
}

// The width also changes without a window resize (the menu is hidden or shown,
// a scrollbar appears after the data renders), so the element itself is
// observed. Environments without ResizeObserver fall back to window resize.
export function useGetWidth() {
  const [width, setWidth] = useState();

  useEffect(() => {
    const update = () => setWidth(measureContentWidth());
    update();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(update);
      observer.observe(findContent());
      return () => observer.disconnect();
    }

    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
    };
  }, []);

  return width;
}
