import React from 'react';
import ZMark from './ZMark';
import { IconAnalytics, IconClose, IconDashboard, IconMarkets, IconPortfolio, IconReports, IconSettings } from './icons';

export type ModuleId = 'dashboard' | 'portfolio' | 'analytics' | 'markets' | 'reports' | 'settings';

export const MODULES: { id: ModuleId; label: string; Icon: React.FC<{ size?: number }>; tint: string }[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: IconDashboard, tint: '139,92,246' },
  { id: 'portfolio', label: 'Portfolio', Icon: IconPortfolio, tint: '34,230,255' },
  { id: 'analytics', label: 'Analytics', Icon: IconAnalytics, tint: '182,255,59' },
  { id: 'markets', label: 'Mercados', Icon: IconMarkets, tint: '255,60,207' },
  { id: 'reports', label: 'Relatórios', Icon: IconReports, tint: '34,230,255' },
  { id: 'settings', label: 'Config', Icon: IconSettings, tint: '139,92,246' },
];

interface Props {
  active: ModuleId;
  onSelect: (id: ModuleId) => void;
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<Props> = ({ active, onSelect, open, onClose }) => (
  <>
    {open && <div className="scrim" onClick={onClose} aria-hidden="true" />}
    <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Navegação principal">
      <div className="brand">
        <div className="brand-mark">
          <ZMark />
        </div>
        <div className="brand-text">
          <span className="brand-name">
            Znit<i>.io</i>
          </span>
          <span className="brand-tag">DASHBOARD</span>
        </div>
        <button type="button" className="icon-btn sidebar-close" onClick={onClose} aria-label="Fechar menu">
          <IconClose />
        </button>
      </div>

      <nav className="nav">
        <span className="nav-label">Menu</span>
        {MODULES.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={`nav-item ${active === id ? 'on' : ''}`}
            aria-current={active === id ? 'page' : undefined}
            aria-label={label}
            title={label}
            onClick={() => {
              onSelect(id);
              onClose();
            }}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="side-foot">
        <span className="dot" aria-hidden="true" />
        <span>Ambiente de demonstração</span>
      </div>
    </aside>
  </>
);

export default Sidebar;
