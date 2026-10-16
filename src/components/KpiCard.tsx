import React from 'react';
import Panel from './Panel';
import { IconArrowDown, IconArrowUp } from './icons';

interface Props {
  label: string;
  value: string;
  sub: React.ReactNode;
  trend?: 'up' | 'down' | 'flat';
  tone: 'cyan' | 'magenta' | 'violet' | 'lime';
  spark?: number[];
  hidden?: boolean;
  index: number;
  beam?: boolean;
}

const Spark: React.FC<{ data: number[] }> = ({ data }) => {
  const lo = Math.min(...data);
  const hi = Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${28 - ((v - lo) / (hi - lo || 1)) * 24}`).join(' ');
  return (
    <svg className="spark" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

const KpiCard: React.FC<Props> = ({ label, value, sub, trend = 'flat', tone, spark, hidden, index, beam }) => (
  <Panel tone={tone} hidden={hidden} index={index} beam={beam} className="kpi">
    <div className="kpi-label">{label}</div>
    <div className="kpi-value">{value}</div>
    <div className={`kpi-sub ${trend}`}>
      {trend === 'up' && <IconArrowUp />}
      {trend === 'down' && <IconArrowDown />}
      <span>{sub}</span>
    </div>
    {spark && spark.length > 2 && <Spark data={spark} />}
  </Panel>
);

export default KpiCard;
