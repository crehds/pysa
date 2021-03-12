import { useEffect, useState } from 'react';

export function useGetWidth() {
  const [width, setWidth] = useState();

  useEffect(() => {
    let elementToSetWidth = document.getElementById('app').offsetWidth - 60;
    const onResize = () => {
      let newWidth = document.getElementById('app').offsetWidth - 60;
      setWidth(newWidth);
    };

    window.addEventListener('resize', onResize);
    setWidth(elementToSetWidth);
    return () => {
      return window.removeEventListener('resize', onResize);
    };
  }, [width]);

  return width;
}
