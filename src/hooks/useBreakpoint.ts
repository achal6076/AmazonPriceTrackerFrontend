import { useState, useEffect } from 'react';

export function useBreakpoint() {
  const [w, setW] = useState(() => window.innerWidth);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return {
    isMobile:  w < 640,           // phones
    isTablet:  w >= 640 && w < 1024,  // tablets / iPads
    isDesktop: w >= 1024,         // laptops+
    w,
  };
}
