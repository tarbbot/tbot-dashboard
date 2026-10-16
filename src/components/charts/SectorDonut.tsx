import React, { useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from 'recharts';
import { SectorPoint } from '../../data/portfolio';
import { formatCurrency } from '../../lib/format';
import { DONUT_COLORS, TipBox } from './kit';

// Active slice grows and glows.
const ActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius + 8}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      style={{ filter: `drop-shadow(0 0 10px ${fill})` }}
    />
  );
};

const SectorDonut: React.FC<{ data: SectorPoint[] }> = ({ data }) => {
  const [active, setActive] = useState<number | undefined>(undefined);
  const color = (i: number) => DONUT_COLORS[i % DONUT_COLORS.length];
  const focus = active !== undefined ? data[active] : undefined;

  return (
    <div className="donut">
      <div className="chart-box donut-box">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="percentage"
              nameKey="sector"
              cx="50%"
              cy="50%"
              outerRadius={84}
              innerRadius={56}
              paddingAngle={3}
              stroke="#08061a"
              strokeWidth={3}
              activeIndex={active}
              activeShape={ActiveShape}
              isAnimationActive={false}
              onMouseEnter={(_, i) => setActive(i)}
              onMouseLeave={() => setActive(undefined)}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={color(i)} />
              ))}
            </Pie>
            <Tooltip
              content={({ active: on, payload }) => {
                if (!on || !payload || !payload.length) return null;
                const d = payload[0].payload as SectorPoint;
                const i = Math.max(0, data.findIndex((x) => x.sector === d.sector));
                return <TipBox title={d.sector} accent={color(i)} rows={[{ name: `${d.percentage}%`, color: color(i), value: formatCurrency(d.value) }]} />;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center" aria-hidden="true">
          <b>{focus ? `${focus.percentage}%` : `${data.length}`}</b>
          <span>{focus ? focus.sector : 'setores'}</span>
        </div>
      </div>
      <ul className="legend">
        {data.map((d, i) => (
          <li
            key={d.sector}
            className={active === i ? 'on' : ''}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(undefined)}
          >
            <i style={{ background: color(i) }} />
            <span>{d.sector}</span>
            <b>{d.percentage}%</b>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SectorDonut;
