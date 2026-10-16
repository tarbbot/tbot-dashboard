import React, { useEffect, useRef } from 'react';

const CELL = 56;
const STEP = 14;
const REACH = 420; // grid is only subdivided this far from the cursor
const GLOW_BANDS = 10; // glow steps from the grid colour (edge of the well) to cyan (centre)
const COLORS = ['34,230,255', '255,60,207', '139,92,246', '182,255,59'];

// Set by the landing page: the RGB the grid should drift toward (one hue per chapter).
export const tint = { c: '139,92,246' };

interface Tick {
  x: number;
  y: number;
  vy: number;
  len: number;
  c: string;
  a: number;
  ph: number;
}

// Fixed canvas: a market-grid that falls into a gravity well around the cursor, a scan beam that lights
// intersections, and order-flow ticks rising with trails.
// Mobile notes: touch never drives the warp, height-only resizes (URL bar) are ignored so
// ticks are not re-seeded mid-scroll, motion is time-based, and nothing allocates gradients.
const CyberBackground: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = performance.now();
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    let ticks: Tick[] = [];
    const col = [139, 92, 246];
    const t0 = performance.now();

    const spawn = (fromBottom: boolean): Tick => ({
      x: Math.random() * w,
      y: fromBottom ? h + Math.random() * 80 : Math.random() * h,
      vy: 0.25 + Math.random() * 1.1,
      len: 8 + Math.random() * 46,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
      a: 0.25 + Math.random() * 0.55,
      ph: Math.random() * Math.PI * 2,
    });

    const resize = () => {
      const nw = window.innerWidth;
      const nh = window.innerHeight;
      // On touch devices the URL bar changes innerHeight while scrolling: keep the larger canvas.
      if (coarse && w && nw === w && nh <= h) return;
      const widthChanged = nw !== w;
      w = nw;
      h = nh;
      const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (widthChanged || !ticks.length) {
        const n = coarse ? 30 : Math.max(36, Math.min(110, Math.round(w / 16)));
        ticks = Array.from({ length: n }, () => spawn(false));
      }
    };

    const warp = (x: number, y: number): [number, number, number] => {
      const dx = x - mouse.x;
      const dy = y - mouse.y;
      const d2 = dx * dx + dy * dy;
      const inf = Math.exp(-d2 / (2 * 170 * 170));
      if (inf < 0.002) return [x, y, 0];
      const d = Math.sqrt(d2) || 1;
      // Gravity well: points fall toward the cursor (never past it) and sink, like a mass bending
      // spacetime. The pull is strongest close in, so lines bunch up around the centre.
      const pull = Math.min(d * 0.82, inf * 52);
      return [x - (dx / d) * pull, y - (dy / d) * pull + inf * 30, inf];
    };

    // One grid line: straight where the cursor is far, sampled and warped near it.
    const line = (base: Path2D, hot: Path2D[], vertical: boolean, c: number, len: number, on: boolean) => {
      const m = vertical ? mouse.x : mouse.y;
      const along = vertical ? mouse.y : mouse.x;
      const pt = (s: number): [number, number] => (vertical ? [c, s] : [s, c]);
      if (!on || Math.abs(c - m) > REACH) {
        const [ax, ay] = pt(0);
        const [bx, by] = pt(len);
        base.moveTo(ax, ay);
        base.lineTo(bx, by);
        return;
      }
      const s0 = Math.max(0, along - REACH);
      const s1 = Math.min(len, along + REACH);
      const [sx, sy] = pt(0);
      base.moveTo(sx, sy);
      let [px, py] = warp(...pt(s0));
      base.lineTo(px, py);
      for (let s = s0 + STEP; s <= s1 + STEP; s += STEP) {
        const [qx, qy, inf] = warp(...pt(Math.min(s, s1)));
        base.lineTo(qx, qy);
        if (hot.length && inf > 0.012) {
          // bucket by how deep in the well this segment is, so the light fades in gradually
          const band = hot[Math.min(GLOW_BANDS - 1, Math.floor(Math.pow(inf, 0.65) * GLOW_BANDS))];
          band.moveTo(px, py);
          band.lineTo(qx, qy);
        }
        px = qx;
        py = qy;
      }
      const [ex, ey] = pt(len);
      base.lineTo(ex, ey);
    };

    const draw = (now: number) => {
      const t = now - t0;
      const dt = Math.min(48, now - last);
      last = now;
      const k = dt / 16.667;
      const ignite = Math.min(1, t / 2200);
      const on = !coarse && mouse.tx > -9000;
      if (on) {
        const f = 1 - Math.pow(1 - 0.12, k);
        mouse.x += (mouse.tx - mouse.x) * f;
        mouse.y += (mouse.ty - mouse.y) * f;
      }
      const scrollY = window.scrollY; // read live: scroll events lag behind on touch devices
      ctx.clearRect(0, 0, w, h);

      const off = (-scrollY * 0.18) % CELL;
      const base = new Path2D();
      const hot = on ? Array.from({ length: GLOW_BANDS }, () => new Path2D()) : [];
      for (let x = 0; x <= w + CELL; x += CELL) line(base, hot, true, x, h, on);
      for (let y = off; y <= h + CELL; y += CELL) line(base, hot, false, y, w, on);
      ctx.lineWidth = 1;
      const goal = tint.c.split(',').map(Number);
      for (let i = 0; i < 3; i++) col[i] += (goal[i] - col[i]) * Math.min(1, 0.04 * k);
      ctx.strokeStyle = `rgba(${col[0] | 0},${col[1] | 0},${col[2] | 0},${0.12 * ignite})`;
      ctx.stroke(base);
      // well glow: each band blends the grid colour into cyan and gets brighter and slightly thicker
      // toward the centre, so there is no visible edge where the light starts
      for (let i = 0; i < hot.length; i++) {
        const f = (i + 0.5) / GLOW_BANDS;
        const m = f * f * (3 - 2 * f); // smoothstep
        const r = col[0] + (34 - col[0]) * m;
        const g = col[1] + (230 - col[1]) * m;
        const bl = col[2] + (255 - col[2]) * m;
        ctx.strokeStyle = `rgba(${r | 0},${g | 0},${bl | 0},${(0.04 + 0.5 * f * f) * ignite})`;
        ctx.lineWidth = 1 + f * 0.7;
        ctx.stroke(hot[i]);
      }
      ctx.lineWidth = 1;

      // the singularity: a dark core with a faint accretion ring at the bottom of the well
      if (on) {
        const cx = mouse.x;
        const cy = mouse.y + 30;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 78);
        g.addColorStop(0, `rgba(0,0,0,${0.7 * ignite})`);
        g.addColorStop(0.55, `rgba(6,4,13,${0.32 * ignite})`);
        g.addColorStop(1, 'rgba(6,4,13,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, 78, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(34,230,255,${0.34 * ignite})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 30, 11, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // scan beam lighting the intersections it crosses
      const beamY = ((t * 0.00007) % 1.3) * (h + 160) - 80;
      for (let gy = off; gy <= h; gy += CELL) {
        const dd = Math.abs(gy - beamY);
        if (dd > 90) continue;
        ctx.fillStyle = `rgba(34,230,255,${(1 - dd / 90) * 0.85 * ignite})`;
        for (let gx = 0; gx <= w; gx += CELL) {
          const [wx, wy] = on ? warp(gx, gy) : [gx, gy];
          ctx.fillRect(wx - 1.5, wy - 1.5, 3, 3);
        }
      }

      // order-flow ticks: three flat rects per tick, no gradients
      for (let i = 0; i < ticks.length; i++) {
        const p = ticks[i];
        p.y -= p.vy * k * (reduce ? 0 : 1);
        if (p.y + p.len < 0) {
          ticks[i] = spawn(true);
          continue;
        }
        const x = p.x + Math.sin(t * 0.0006 + p.ph) * 6;
        const fade = Math.max(0, Math.min(1, (h - p.y) / 120) * Math.min(1, (p.y + p.len) / 140));
        const al = p.a * fade * ignite;
        if (al < 0.01) continue;
        ctx.fillStyle = `rgb(${p.c})`;
        ctx.globalAlpha = al * 0.3;
        ctx.fillRect(x - 0.75, p.y, 1.5, p.len);
        ctx.globalAlpha = al * 0.65;
        ctx.fillRect(x - 0.75, p.y, 1.5, p.len * 0.35);
        ctx.globalAlpha = Math.min(1, al * 1.4);
        ctx.fillRect(x - 1.25, p.y - 1, 2.5, 2.5);
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      draw(now);
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      mouse.tx = e.clientX;
      mouse.ty = e.clientY;
      if (mouse.x < -9000) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      }
    };
    const onLeave = () => {
      mouse.tx = mouse.ty = mouse.x = mouse.y = -9999;
    };
    const onVis = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      if (!document.hidden && !reduce) raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    window.addEventListener('blur', onLeave);
    document.addEventListener('visibilitychange', onVis);
    if (reduce) draw(t0 + 4000);
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('blur', onLeave);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return <canvas ref={ref} className="zn-bg" aria-hidden="true" />;
};

export default CyberBackground;
