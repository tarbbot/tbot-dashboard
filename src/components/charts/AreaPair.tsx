import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { HistoryPoint } from '../../data/portfolio';
import { formatCurrency } from '../../lib/format';
import { axisProps, GlowDefs, GRID_STROKE, TipBox } from './kit';

interface Props {
  id: string;
  data: HistoryPoint[];
  main: { name: string; color: string };
  bench: { name: string; color: string };
  accent: string;
}

// Two filled lines (the strategy against its reference), used for growth and intraday trading.
const AreaPair: React.FC<Props> = ({ id, data, main, bench, accent }) => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
      <defs>
        <linearGradient id={`${id}-m`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={main.color} stopOpacity={0.55} />
          <stop offset="100%" stopColor={main.color} stopOpacity={0} />
        </linearGradient>
        <linearGradient id={`${id}-r`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={bench.color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={bench.color} stopOpacity={0} />
        </linearGradient>
        <GlowDefs id={`${id}-g`} />
      </defs>
      <CartesianGrid stroke={GRID_STROKE} vertical={false} />
      <XAxis dataKey="date" {...axisProps} tickLine={false} minTickGap={24} />
      <YAxis {...axisProps} tickLine={false} domain={['auto', 'auto']} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} width={44} />
      <Tooltip
        cursor={{ stroke: accent, strokeOpacity: 0.35 }}
        content={({ active, payload }) =>
          active && payload && payload.length ? (
            <TipBox
              title={String(payload[0].payload.date)}
              accent={accent}
              rows={payload.map((p) => ({
                name: String(p.name),
                color: p.name === main.name ? main.color : bench.color,
                value: formatCurrency(Number(p.value)),
              }))}
            />
          ) : null
        }
      />
      <Area type="monotone" dataKey="benchmark" name={bench.name} stroke={bench.color} strokeWidth={2} fill={`url(#${id}-r)`} isAnimationActive={false} filter={`url(#${id}-g)`} />
      <Area type="monotone" dataKey="value" name={main.name} stroke={main.color} strokeWidth={3} fill={`url(#${id}-m)`} isAnimationActive={false} filter={`url(#${id}-g)`} />
    </AreaChart>
  </ResponsiveContainer>
);

export default AreaPair;
