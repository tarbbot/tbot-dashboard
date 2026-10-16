import React, { useRef } from 'react';
import { useReveal } from '../lib/fx';
import Panel from './Panel';
import { MODULES } from './Sidebar';
import type { ModuleId } from './Sidebar';

const ModuleSoon: React.FC<{ id: ModuleId }> = ({ id }) => {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);
  const m = MODULES.find((x) => x.id === id);
  const Icon = m?.Icon;
  return (
    <div ref={root} className="view soon">
      <Panel hud beam tone="cyan" className="soon-panel">
        <div className="soon-ico">{Icon && <Icon size={64} />}</div>
        <p>Esta seção está em desenvolvimento</p>
        <div className="soon-bar" aria-hidden="true">
          <i />
        </div>
      </Panel>
    </div>
  );
};

export default ModuleSoon;
