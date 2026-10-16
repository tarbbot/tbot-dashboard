import React from 'react';
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { VolatilityPoint } from '../../data/portfolio';
import { axisProps, C, GlowDefs, GRID_STROKE, TipBox } from './kit';

const VolatilityChart: React.FC<{ data: VolatilityPoint[] }> = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <ComposedChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
      <defs>
        <linearGradient id="vol-band" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.violet} stopOpacity={0.5} />
          <stop offset="100%" stopColor={C.violet} stopOpacity={0} />
        </linearGradient>
        <GlowDefs id="vol-glow" />
      </defs>
      <CartesianGrid stroke={GRID_STROKE} vertical={false} />
      <XAxis dataKey="time" {...axisProps} tickLine={false} interval={4} />
      <YAxis {...axisProps} tickLine={false} domain={['dataMin - 5', 'dataMax + 5']} tickFormatter={(v: number) => v.toFixed(0)} width={40} />
      <Tooltip
        cursor={{ stroke: C.cyan, strokeOpacity: 0.35 }}
        content={({ active, payload, label }) =>
          active && payload && payload.length ? (
            <TipBox
              title={`Período ${label}`}
              rows={payload
                .filter((p) => p.dataKey === 'value')
                .map((p) => ({ name: 'Volatilidade', color: C.cyan, value: typeof p.value === 'number' ? p.value.toFixed(2) : String(p.value) }))}
            />
          ) : null
        }
      />
      <Area type="monotone" dataKey="upperBand" stroke="none" fill="url(#vol-band)" fillOpacity={0.6} isAnimationActive={false} />
      <Area type="monotone" dataKey="lowerBand" stroke="none" fill="url(#vol-band)" fillOpacity={0.3} isAnimationActive={false} />
      <Line type="monotone" dataKey="value" stroke={C.cyan} strokeWidth={3} dot={false} activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2, fill: C.cyan }} isAnimationActive={false} filter="url(#vol-glow)" />
    </ComposedChart>
  </ResponsiveContainer>
);

export default VolatilityChart;
