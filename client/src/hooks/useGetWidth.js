import { useEffect, useState } from 'react';

// Width of the area the pages draw in: the <main> element when it is on the
// page (it is the full width on phones and the width next to the rail on
// wide screens), else the whole app.
function measureContentWidth() {
  const content =
    document.querySelector('main') || document.getElementById('app');
  return content.clientWidth;
}

export function useGetWidth() {
  const [width, setWidth] = useState();

  useEffect(() => {
    const onResize = () => setWidth(measureContentWidth());

    window.addEventListener('resize', onResize);
    setWidth(measureContentWidth());
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return width;
}
