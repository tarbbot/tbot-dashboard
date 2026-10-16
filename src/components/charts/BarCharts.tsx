import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Asset, PerformancePoint } from '../../data/portfolio';
import { axisProps, C, GRID_STROKE, TipBox } from './kit';

export const PerformanceBars: React.FC<{ data: PerformancePoint[] }> = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }} barGap={4}>
      <defs>
        <linearGradient id="perf-a" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={C.violet} />
          <stop offset="100%" stopColor={C.cyan} />
        </linearGradient>
        <linearGradient id="perf-b" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={C.violet} stopOpacity={0.5} />
          <stop offset="100%" stopColor={C.magenta} />
        </linearGradient>
      </defs>
      <CartesianGrid stroke={GRID_STROKE} vertical={false} />
      <XAxis dataKey="period" {...axisProps} tickLine={false} />
      <YAxis {...axisProps} tickLine={false} tickFormatter={(v: number) => `${v}%`} width={44} />
      <Tooltip
        cursor={{ fill: 'rgba(34,230,255,0.06)' }}
        content={({ active, payload }) =>
          active && payload && payload.length ? (
            <TipBox
              title={String(payload[0].payload.period)}
              rows={payload.map((p) => ({
                name: p.dataKey === 'portfolio' ? 'Portfolio' : 'Benchmark',
                color: p.dataKey === 'portfolio' ? C.cyan : C.magenta,
                value: `${p.value}%`,
              }))}
            />
          ) : null
        }
      />
      <Bar dataKey="portfolio" fill="url(#perf-a)" radius={[2, 2, 0, 0]} animationDuration={1400} animationEasing="ease-out" />
      <Bar dataKey="benchmark" fill="url(#perf-b)" radius={[2, 2, 0, 0]} animationDuration={1400} animationEasing="ease-out" />
    </BarChart>
  </ResponsiveContainer>
);

export const VolumeBars: React.FC<{ data: Asset[] }> = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
      <defs>
        <linearGradient id="vol-bar" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={C.cyan} stopOpacity={0.6} />
          <stop offset="100%" stopColor={C.lime} />
        </linearGradient>
      </defs>
      <CartesianGrid stroke={GRID_STROKE} vertical={false} />
      <XAxis dataKey="symbol" {...axisProps} tickLine={false} />
      <YAxis {...axisProps} tickLine={false} width={40} />
      <Tooltip
        cursor={{ fill: 'rgba(182,255,59,0.06)' }}
        content={({ active, payload }) =>
          active && payload && payload.length ? (
            <TipBox
              title={String(payload[0].payload.symbol)}
              accent={C.lime}
              rows={[{ name: 'Quantidade', color: C.lime, value: String(payload[0].value) }]}
            />
          ) : null
        }
      />
      <Bar dataKey="quantity" fill="url(#vol-bar)" radius={[2, 2, 0, 0]} animationDuration={1400} animationEasing="ease-out" />
    </BarChart>
  </ResponsiveContainer>
);
