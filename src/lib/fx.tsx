import React, { useEffect, useRef, useState } from 'react';

export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Adds `.in` to every `.rv` / `.wipe` inside the root once it enters the viewport (once).
export const useReveal = (root: React.RefObject<HTMLElement | null>) => {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const targets = el.querySelectorAll('.rv, .wipe, .gate');
    if (reducedMotion() || !('IntersectionObserver' in window)) {
      targets.forEach((n) => n.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    targets.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [root]);
};

export const useInView = <T extends HTMLElement>(once = true) => {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion() || !('IntersectionObserver' in window)) {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          if (once) io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);
  return [ref, seen] as const;
};

const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789<>/\\_+-=#';

// Decodes text left to right when it enters the viewport. Real text stays in the DOM
// (hidden under the overlay) so layout, selection and screen readers see the final copy.
export const Scramble: React.FC<{ text: string; delay?: number; className?: string; as?: 'span' | 'h1' | 'h2' | 'h3' }> = ({
  text,
  delay = 0,
  className = '',
  as: Tag = 'span',
}) => {
  const [ref, seen] = useInView<HTMLElement>();
  const [out, setOut] = useState<string | null>(null);

  useEffect(() => {
    if (!seen || reducedMotion()) return;
    let raf = 0;
    const start = performance.now() + delay;
    const dur = Math.min(1100, 380 + text.length * 22);
    const step = (now: number) => {
      const p = (now - start) / dur;
      if (p < 0) {
        setOut(text.replace(/\S/g, ' '));
        raf = requestAnimationFrame(step);
        return;
      }
      if (p >= 1) {
        setOut(null);
        return;
      }
      const lock = Math.floor(p * text.length);
      setOut(
        text
          .split('')
          .map((ch, i) =>
            ch === ' ' || i < lock ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          )
          .join('')
      );
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [seen, text, delay]);

  const pre = !seen && !reducedMotion();
  return (
    <Tag ref={ref as any} className={`scr ${className}`}>
      <span style={{ visibility: out !== null || pre ? 'hidden' : 'visible' }}>{text}</span>
      {(out !== null || pre) && (
        <span className="scr-ov" aria-hidden="true">
          {out ?? text.replace(/\S/g, ' ')}
        </span>
      )}
    </Tag>
  );
};

// Counts the numeric part of values like "50+", "$5M+", "99.9%".
export const Counter: React.FC<{ value: string }> = ({ value }) => {
  const [ref, seen] = useInView<HTMLSpanElement>();
  const m = value.match(/^(\D*)([\d.]+)(.*)$/);
  const [n, setN] = useState(reducedMotion() || !m ? 1 : 0);

  useEffect(() => {
    if (!seen || !m || reducedMotion()) return;
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / 1400);
      setN(1 - Math.pow(1 - p, 4));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seen]);

  if (!m) return <span ref={ref}>{value}</span>;
  const target = parseFloat(m[2]);
  const dec = (m[2].split('.')[1] || '').length;
  return (
    <span ref={ref}>
      {m[1]}
      {(target * n).toFixed(dec)}
      {m[3]}
    </span>
  );
};
