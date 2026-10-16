import React from 'react';

interface Props {
  title?: string;
  tag?: string;
  tone?: 'cyan' | 'magenta' | 'violet' | 'lime';
  beam?: boolean;
  hud?: boolean;
  hidden?: boolean;
  index?: number;
  className?: string;
  children: React.ReactNode;
}

// The one container every block uses: chamfered edge, optional corner brackets and travelling light.
const Panel: React.FC<Props> = ({ title, tag, tone = 'cyan', beam, hud, hidden, index = 0, className = '', children }) => (
  <section
    className={`zn-panel panel tone-${tone} rv ${beam ? 'beam' : ''} ${hud ? 'hud' : ''} ${hidden ? 'is-hidden' : ''} ${className}`}
    style={{ ['--i' as string]: index }}
  >
    {hud && (
      <>
        <i className="c tl" />
        <i className="c tr" />
        <i className="c bl" />
        <i className="c br" />
      </>
    )}
    {(title || tag) && (
      <header className="panel-head">
        {title && <h3 className="panel-title">{title}</h3>}
        {tag && <span className="panel-tag">{tag}</span>}
      </header>
    )}
    {children}
  </section>
);

export default Panel;
