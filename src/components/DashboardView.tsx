import React, { useEffect, useRef } from 'react';
import { PortfolioData, Period, SectorPoint } from '../data/portfolio';
import { matches, SEARCHABLE } from '../data/searchable';
import { useCountUp } from '../hooks/useCountUp';
import { reducedMotion, useReveal } from '../lib/fx';
import { formatCurrency, formatPercent } from '../lib/format';
import AreaPair from './charts/AreaPair';
import { PerformanceBars, VolumeBars } from './charts/BarCharts';
import { C } from './charts/kit';
import LayerRings from './charts/LayerRings';
import SectorDonut from './charts/SectorDonut';
import VolatilityChart from './charts/VolatilityChart';
import KpiCard from './KpiCard';
import Panel from './Panel';

interface Props {
  data: PortfolioData;
  period: Period;
  search: string;
}

const tail = (a: { value: number }[], n = 28) => a.slice(-n).map((x) => x.value);

const DashboardView: React.FC<Props> = ({ data, period, search }) => {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);

  // Panels scrolled out of view stop animating (their light beams keep running otherwise).
  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion() || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.target.classList.toggle('is-off', !e.isIntersecting)),
      { rootMargin: '120px 0px' }
    );
    el.querySelectorAll('.panel').forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  const show = (id: string) => {
    const item = SEARCHABLE.find((s) => s.id === id);
    return !item || matches(item, search);
  };

  const total = useCountUp(data.totalCurrent, 1500, 100);
  const profit = useCountUp(data.totalProfit, 1500, 200);
  const assets = useCountUp(data.assets.length, 1200, 300);
  const perf = useCountUp(2.3, 1200, 400);
  const sectors: SectorPoint[] = data.sectors;

  return (
    <div ref={root} className="view">
      <div className="grid-kpi">
        <KpiCard
          index={0}
          beam
          tone="violet"
          hidden={!show('valor-total')}
          label="VALOR TOTAL"
          value={formatCurrency(total)}
          trend={data.totalProfit >= 0 ? 'up' : 'down'}
          sub={formatPercent(data.totalProfitPercent)}
          spark={tail(data.historical)}
        />
        <KpiCard
          index={1}
          tone="lime"
          hidden={!show('lucro-realizado')}
          label="LUCRO REALIZADO"
          value={formatCurrency(profit)}
          trend="up"
          sub={`Rentabilidade: ${data.totalProfitPercent}%`}
          spark={tail(data.trading)}
        />
        <KpiCard
          index={2}
          tone="cyan"
          hidden={!show('ativos')}
          label="ATIVOS"
          value={String(Math.round(assets))}
          sub={`Em ${sectors.length} setores`}
        />
        <KpiCard
          index={3}
          tone="magenta"
          hidden={!show('performance')}
          label="PERFORMANCE (1Y)"
          value={`+${perf.toFixed(1)}%`}
          trend="up"
          sub="vs Benchmark: +28.5%"
        />
      </div>

      <div className="grid-main">
        <div className="col left">
          <Panel index={4} beam hud tone="cyan" hidden={!show('crescimento')} title="Crescimento Patrimonial" tag="PORTFOLIO × BENCHMARK">
            <div className="chart-box reveal-x" key={`g-${period}`}>
              <AreaPair id="growth" data={data.historical} main={{ name: 'Portfolio', color: C.cyan }} bench={{ name: 'Benchmark', color: C.violet }} accent={C.cyan} />
            </div>
          </Panel>

          <Panel index={5} tone="magenta" title="Operações Intraday" tag="TRADING × REFERÊNCIA">
            <div className="chart-box reveal-x" key={`t-${period}`}>
              <AreaPair id="trade" data={data.trading} main={{ name: 'Trading', color: C.magenta }} bench={{ name: 'Referência', color: C.lime }} accent={C.magenta} />
            </div>
          </Panel>

          <div className="grid-tiles">
            <Panel index={6} tone="lime" className="tile">
              <div className="kpi-label">VOLUME DIÁRIO</div>
              <div className="tile-value">R$ 2.8M</div>
              <div className="kpi-sub up">
                <span>+12.5% vs ontem</span>
              </div>
            </Panel>
            <Panel index={7} tone="cyan" className="tile">
              <div className="kpi-label">POSIÇÕES ATIVAS</div>
              <div className="tile-value">18</div>
              <div className="kpi-sub flat">
                <span>3 abertas hoje</span>
              </div>
            </Panel>
            <Panel index={8} tone="violet" className="tile">
              <div className="kpi-label">TAXA DE ACERTO</div>
              <div className="tile-value">68.5%</div>
              <div className="kpi-sub flat">
                <span>Últimos 30 dias</span>
              </div>
            </Panel>
          </div>
        </div>

        <div className="col">
          <Panel index={9} tone="violet" hidden={!show('setores')} title="Distribuição por Setor" tag="PERÍODO">
            <SectorDonut key={`s-${period}`} data={sectors} />
          </Panel>
          <Panel index={10} beam tone="magenta" hidden={!show('circulos')} title="Composição em Camadas" tag="ALOCAÇÃO">
            <LayerRings key={`l-${period}`} layers={data.layers} />
          </Panel>
        </div>
      </div>

      <div className="grid-bottom">
        <Panel index={11} tone="cyan" title="Análise de Volatilidade" tag="BANDA ±8">
          <div className="chart-box reveal-x" key={`v-${period}`}>
            <VolatilityChart data={data.volatility} />
          </div>
        </Panel>
        <Panel index={12} tone="violet" hidden={!show('comparativa')} title="Performance Comparativa" tag="VS BENCHMARK">
          <div className="chart-box" key={`p-${period}`}>
            <PerformanceBars data={data.performance} />
          </div>
        </Panel>
        <Panel index={13} tone="lime" hidden={!show('volume')} title="Volume por Ativo" tag="QUANTIDADE">
          <div className="chart-box" key={`q-${period}`}>
            <VolumeBars data={data.assets} />
          </div>
        </Panel>
      </div>
    </div>
  );
};

export default DashboardView;
