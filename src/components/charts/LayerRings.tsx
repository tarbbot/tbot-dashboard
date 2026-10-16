import React, { useState } from 'react';
import { Layer } from '../../data/portfolio';
import { formatCurrency } from '../../lib/format';

// Concentric progress rings: one ring per layer of the portfolio.
const LayerRings: React.FC<{ layers: Layer[] }> = ({ layers }) => {
  const [hover, setHover] = useState<number | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const stocks = layers[1];
  const bonds = layers[2];
  const reserve = layers[3];

  return (
    <div className="rings">
      <div
        className="rings-stage"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
        }}
      >
        {hover !== null && (
          <div className="rings-tip" style={{ left: pos.x + 14, top: pos.y - 10, ['--tip' as string]: layers[hover].color }}>
            <b>{layers[hover].name}</b>
            <span>{formatCurrency(layers[hover].value)}</span>
            <em>{layers[hover].percentage}% do total</em>
          </div>
        )}
        <svg width="220" height="220" viewBox="0 0 220 220" role="img" aria-label="Composição do portfólio em camadas">
          <g transform="rotate(-90 110 110)">
            {layers.map((l, i) => {
              const r = 88 - i * 21;
              const len = 2 * Math.PI * r;
              return (
                <g key={l.name} opacity={hover === null || hover === i ? 1 : 0.35} style={{ transition: 'opacity .3s' }}>
                  <circle cx="110" cy="110" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
                  <circle
                    className="ring"
                    cx="110"
                    cy="110"
                    r={r}
                    fill="none"
                    stroke={l.color}
                    strokeWidth="14"
                    strokeDasharray={len}
                    strokeDashoffset={len - (l.percentage / 100) * len}
                    style={{ ['--len' as string]: len, ['--off' as string]: len - (l.percentage / 100) * len, animationDelay: `${i * 0.12}s` }}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                  />
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <ul className="bars">
        {layers.map((l, i) => (
          <li key={l.name} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} className={hover === i ? 'on' : ''}>
            <div className="bars-row">
              <i style={{ background: l.color }} />
              <span>{l.name}</span>
              <em>{formatCurrency(l.value)}</em>
              <b style={{ color: l.color }}>{l.percentage}%</b>
            </div>
            <div className="bars-track">
              <div className="bars-fill" style={{ width: `${l.percentage}%`, background: l.color, animationDelay: `${i * 0.12}s` }} />
            </div>
          </li>
        ))}
      </ul>

      <p className="rings-note">
        Estrutura com <strong style={{ color: stocks.color }}>{stocks.percentage}% em ações</strong> para crescimento,{' '}
        <strong style={{ color: bonds.color }}>{bonds.percentage}% em renda fixa</strong> para estabilidade e{' '}
        <strong style={{ color: reserve.color }}>{reserve.percentage}% de reserva</strong> para oportunidades.
      </p>
    </div>
  );
};

export default LayerRings;
