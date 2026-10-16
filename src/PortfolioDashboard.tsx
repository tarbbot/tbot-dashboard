import React, { useEffect, useMemo, useState } from 'react';
import CyberBackground, { tint } from './components/CyberBackground';
import DashboardView from './components/DashboardView';
import ModuleSoon from './components/ModuleSoon';
import Sidebar, { ModuleId, MODULES } from './components/Sidebar';
import Topbar from './components/Topbar';
import { buildPortfolio, PERIOD_LABEL, Period } from './data/portfolio';
import { Scramble } from './lib/fx';
import { attachLens } from './lib/lens';
import './styles/theme.css';
import './styles/dashboard.css';

const PortfolioDashboard: React.FC = () => {
  const [module, setModule] = useState<ModuleId>('dashboard');
  const [period, setPeriod] = useState<Period>('30D');
  const [search, setSearch] = useState('');
  const [menu, setMenu] = useState(false);

  const data = useMemo(() => buildPortfolio(period), [period]);
  const current = MODULES.find((m) => m.id === module)!;

  // The background grid takes the hue of the open module.
  useEffect(() => {
    tint.c = current.tint;
  }, [current]);

  // Panel light follows the cursor with inertia (see lib/lens.ts).
  useEffect(() => attachLens(), []);

  // Lock page scroll behind the mobile drawer.
  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menu]);

  return (
    <div className="app">
      <a href="#main" className="skip-link">
        Pular para o conteúdo
      </a>
      <CyberBackground />
      <Sidebar active={module} onSelect={setModule} open={menu} onClose={() => setMenu(false)} />

      <div className="main">
        <Topbar search={search} onSearch={setSearch} period={period} onPeriod={setPeriod} onMenu={() => setMenu(true)} />
        <main id="main" tabIndex={-1} className="content">
          <header className="page-head">
            <h1>
              <Scramble key={module} text={current.label} />
            </h1>
            <p>{module === 'dashboard' ? `Visão geral · ${PERIOD_LABEL[period]}` : 'Em breve'}</p>
          </header>
          {module === 'dashboard' ? <DashboardView key="dashboard" data={data} period={period} search={search} /> : <ModuleSoon key={module} id={module} />}
        </main>
      </div>
    </div>
  );
};

export default PortfolioDashboard;
