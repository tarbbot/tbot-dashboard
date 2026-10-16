import React from 'react';

export const C = {
  cyan: '#22e6ff',
  magenta: '#ff3ccf',
  violet: '#8b5cf6',
  lime: '#b6ff3b',
  amber: '#ffbe0b',
  blue: '#3a86ff',
};
export const DONUT_COLORS = [C.cyan, C.magenta, C.violet, C.lime, C.amber, C.blue];

export const GRID_STROKE = 'rgba(255,255,255,0.06)';
export const axisProps = {
  stroke: 'rgba(255,255,255,0.14)',
  tick: { fill: '#8f8cae', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" },
} as const;

export interface TipRow {
  name: string;
  color: string;
  value: string;
}

// One tooltip look for every chart: dark chamfered box, mono values.
export const TipBox: React.FC<{ title?: string; rows: TipRow[]; accent?: string }> = ({ title, rows, accent = C.cyan }) => (
  <div className="tip" style={{ ['--tip' as string]: accent }}>
    {title && <div className="tip-title">{title}</div>}
    {rows.map((r) => (
      <div key={r.name} className="tip-row">
        <i style={{ background: r.color }} />
        <span>{r.name}</span>
        <b>{r.value}</b>
      </div>
    ))}
  </div>
);

// Shared SVG defs: soft glow for lines.
export const GlowDefs: React.FC<{ id: string }> = ({ id }) => (
  <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur stdDeviation="2" result="b" />
    <feMerge>
      <feMergeNode in="b" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
);
