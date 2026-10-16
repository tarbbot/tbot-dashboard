// Hovered panels get the same spacetime mesh as the page background: a grid that falls into a gravity
// well under the cursor. The light trails the cursor with inertia, waves keep flowing inward, a shockwave
// leaves the point where the cursor entered, and the core pulses. Only the panel under the pointer has a
// canvas; it sits between the panel fill and its text (z-index -1) and is clipped by the panel's chamfer.
const CELL = 26;
const STEP = 10;
const REACH = 200;
const SIGMA = 78;
const BANDS = 8;
const FALLBACK_TC: [number, number, number] = [34, 230, 255];
const calm = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface Mesh {
  panel: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  tc: [number, number, number];
  tx: number;
  ty: number;
  x: number;
  y: number;
  born: number;
  hover: boolean;
  fade: number;
  last: number;
  raf: number;
}

const readTone = (el: HTMLElement): [number, number, number] => {
  const v = getComputedStyle(el).getPropertyValue('--tc').split(',').map((n) => parseFloat(n));
  return v.length === 3 && v.every((n) => !isNaN(n)) ? (v as [number, number, number]) : FALLBACK_TC;
};

export function attachLens(selector = '.zn-panel'): () => void {
  const meshes = new Map<HTMLElement, Mesh>();
  let active: HTMLElement | null = null;

  const destroy = (m: Mesh) => {
    cancelAnimationFrame(m.raf);
    m.canvas.remove();
    meshes.delete(m.panel);
  };

  const draw = (m: Mesh, now: number) => {
    const dt = Math.min(48, now - m.last);
    m.last = now;
    m.fade = Math.min(1, Math.max(0, m.fade + (m.hover ? dt / 200 : -dt / 340)));
    if (!m.hover && m.fade <= 0) return destroy(m);

    // inertia: the well lags behind the cursor
    const k = 1 - Math.pow(1 - 0.16, dt / 16.667);
    m.x += (m.tx - m.x) * k;
    m.y += (m.ty - m.y) * k;

    const { ctx, w, h } = m;
    const [R, G, B] = m.tc;
    ctx.clearRect(0, 0, w, h);

    const shock = (now - m.born) * 0.5; // radius of the entry shockwave in px
    const shockOn = shock < 360;

    const band = Array.from({ length: BANDS }, () => new Path2D());
    const base = new Path2D();

    // returns [x, y, level 0..1] for a mesh point
    const point = (px: number, py: number): [number, number, number] => {
      const dx = px - m.x;
      const dy = py - m.y;
      const d2 = dx * dx + dy * dy;
      const inf = Math.exp(-d2 / (2 * SIGMA * SIGMA));
      const d = Math.sqrt(d2) || 1;
      let ring = 0;
      if (shockOn) {
        const e = d - shock;
        ring = Math.exp(-(e * e) / 450) * (1 - shock / 360);
      }
      if (inf < 0.004 && ring < 0.01) return [px, py, 0];
      const pull = Math.min(d * 0.8, inf * 22);
      const wave = 0.5 + 0.5 * Math.sin(d * 0.05 + now * 0.0062); // crests move toward the centre
      const level = Math.min(1, inf * (0.45 + 0.55 * wave) + ring * 0.9);
      return [px - (dx / d) * pull + (dx / d) * ring * 7, py - (dy / d) * pull + inf * 12 + (dy / d) * ring * 7, level];
    };

    const line = (vertical: boolean, c: number, len: number) => {
      const m0 = vertical ? m.x : m.y;
      const along = vertical ? m.y : m.x;
      const at = (s: number): [number, number] => (vertical ? [c, s] : [s, c]);
      const near = Math.abs(c - m0) < REACH || shockOn;
      if (!near) {
        const [ax, ay] = at(0);
        const [bx, by] = at(len);
        base.moveTo(ax, ay);
        base.lineTo(bx, by);
        return;
      }
      const s0 = shockOn ? 0 : Math.max(0, along - REACH);
      const s1 = shockOn ? len : Math.min(len, along + REACH);
      const [sx, sy] = at(0);
      base.moveTo(sx, sy);
      let [px, py] = point(...at(s0));
      base.lineTo(px, py);
      for (let s = s0 + STEP; s <= s1 + STEP; s += STEP) {
        const [qx, qy, lv] = point(...at(Math.min(s, s1)));
        base.lineTo(qx, qy);
        if (lv > 0.03) {
          const b = band[Math.min(BANDS - 1, Math.floor(Math.pow(lv, 0.7) * BANDS))];
          b.moveTo(px, py);
          b.lineTo(qx, qy);
        }
        px = qx;
        py = qy;
      }
      const [ex, ey] = at(len);
      base.lineTo(ex, ey);
    };

    const offX = (CELL - ((m.w / 2) % CELL)) % CELL;
    for (let x = offX; x <= w; x += CELL) line(true, x, h);
    for (let y = 0; y <= h; y += CELL) line(false, y, w);

    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(139,92,246,${0.13 * m.fade})`;
    ctx.stroke(base);
    for (let i = 0; i < BANDS; i++) {
      const f = (i + 0.5) / BANDS;
      const s = f * f * (3 - 2 * f);
      ctx.strokeStyle = `rgba(${(139 + (R - 139) * s) | 0},${(92 + (G - 92) * s) | 0},${(246 + (B - 246) * s) | 0},${(0.05 + 0.62 * f * f) * m.fade})`;
      ctx.lineWidth = 1 + f * 0.8;
      ctx.stroke(band[i]);
    }

    // singularity: dark core and a ring, both breathing
    const pulse = 1 + 0.12 * Math.sin(now * 0.0031);
    const cx = m.x;
    const cy = m.y + 14;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 64 * pulse);
    g.addColorStop(0, `rgba(0,0,0,${0.62 * m.fade})`);
    g.addColorStop(0.55, `rgba(6,4,13,${0.28 * m.fade})`);
    g.addColorStop(1, 'rgba(6,4,13,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, 64 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(${R},${G},${B},${0.5 * m.fade})`;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 26 * pulse, 10 * pulse, 0, 0, Math.PI * 2);
    ctx.stroke();

    m.raf = requestAnimationFrame((t) => draw(m, t));
  };

  const start = (panel: HTMLElement, x: number, y: number): Mesh => {
    const old = meshes.get(panel);
    if (old) {
      old.hover = true;
      old.tx = x;
      old.ty = y;
      return old;
    }
    const w = panel.clientWidth - 2;
    const h = panel.clientHeight - 2;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const canvas = document.createElement('canvas');
    canvas.className = 'lens-canvas';
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.setAttribute('aria-hidden', 'true');
    panel.appendChild(canvas);
    const ctx = canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const now = performance.now();
    const m: Mesh = { panel, canvas, ctx, w, h, tc: readTone(panel), tx: x, ty: y, x, y, born: now, hover: true, fade: 0, last: now, raf: 0 };
    meshes.set(panel, m);
    m.raf = requestAnimationFrame((t) => draw(m, t));
    return m;
  };

  const leave = () => {
    if (active) {
      const m = meshes.get(active);
      if (m) m.hover = false;
    }
    active = null;
  };

  const move = (e: PointerEvent) => {
    if (e.pointerType === 'touch' || calm()) return;
    const p = (e.target as HTMLElement).closest<HTMLElement>(selector);
    if (!p) return leave();
    const b = p.getBoundingClientRect();
    const x = e.clientX - b.left - 1;
    const y = e.clientY - b.top - 1;
    if (p !== active) {
      leave();
      active = p;
      start(p, x, y); // a new panel: the shockwave starts here, right under the cursor
      return;
    }
    const m = meshes.get(p);
    if (m) {
      m.tx = x;
      m.ty = y;
    } else start(p, x, y);
  };

  window.addEventListener('pointermove', move, { passive: true });
  document.documentElement.addEventListener('mouseleave', leave);
  return () => {
    window.removeEventListener('pointermove', move);
    document.documentElement.removeEventListener('mouseleave', leave);
    meshes.forEach(destroy);
  };
}
