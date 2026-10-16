import React from 'react';

// The Znit "Z": two bars joined by one diagonal. Same outline as /public/favicon.svg.
const ZMark: React.FC<{ className?: string; color?: string }> = ({ className, color = '#06040d' }) => (
  <svg viewBox="11 11 42 42" className={className} aria-hidden="true">
    <path d="M13 13 H51 V23 L30 41 H51 V51 H13 V41 L34 23 H13 Z" fill={color} />
  </svg>
);

export default ZMark;
