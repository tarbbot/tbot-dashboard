import { useEffect, useState } from 'react';
import { reducedMotion } from '../lib/fx';

// Eases from 0 to `target` every time `target` or `key` changes.
export function useCountUp(target: number, duration = 1400, delay = 0): number {
  const [v, setV] = useState(reducedMotion() ? target : 0);
  useEffect(() => {
    if (reducedMotion()) {
      setV(target);
      return;
    }
    let raf = 0;
    setV(0);
    const t0 = performance.now() + delay;
    const step = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - t0) / duration));
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, delay]);
  return v;
}
