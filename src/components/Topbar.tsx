import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PERIOD_LABEL, PERIODS, Period } from '../data/portfolio';
import { matches, SEARCHABLE } from '../data/searchable';
import { useOutsideClose } from '../hooks/useOutsideClose';
import { IconBell, IconChevron, IconLogout, IconMessage, IconSearch, IconSettings, IconUser } from './icons';

interface Props {
  search: string;
  onSearch: (v: string) => void;
  period: Period;
  onPeriod: (p: Period) => void;
  onMenu: () => void;
}

const readToken = (): { name: string; email: string; logged: boolean } => {
  const fallback = { name: 'Usuário', email: '', logged: false };
  try {
    const token = localStorage.getItem('idToken');
    if (!token) return fallback;
    const p = JSON.parse(atob(token.split('.')[1]));
    const email: string = p.email || '';
    return { name: p.name || (email ? email.split('@')[0] : 'Usuário'), email, logged: true };
  } catch {
    return { ...fallback, logged: !!localStorage.getItem('idToken') };
  }
};

const Topbar: React.FC<Props> = ({ search, onSearch, period, onPeriod, onMenu }) => {
  const [user, setUser] = useState(readToken);
  const [panel, setPanel] = useState<null | 'notif' | 'msg' | 'user'>(null);
  const [sIdx, setSIdx] = useState(0);
  const [focused, setFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const msgRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => (search.trim() ? SEARCHABLE.filter((s) => matches(s, search)) : []), [search]);
  useEffect(() => setSIdx(0), [search]);

  useOutsideClose(searchRef, focused, () => setFocused(false));
  useOutsideClose(bellRef, panel === 'notif', () => setPanel(null));
  useOutsideClose(msgRef, panel === 'msg', () => setPanel(null));
  useOutsideClose(userRef, panel === 'user', () => setPanel(null));
  const toggle = (p: 'notif' | 'msg' | 'user') => setPanel((cur) => (cur === p ? null : p));

  return (
    <header className="topbar">
      <button type="button" className="icon-btn burger" onClick={onMenu} aria-label="Abrir menu">
        <i />
        <i />
        <i />
      </button>

      <div className="search" ref={searchRef} role="search">
        <IconSearch className="search-ico" />
        <input
          type="text"
          name="q"
          autoComplete="off"
          spellCheck={false}
          placeholder="Pesquisar componentes…"
          aria-label="Pesquisar componentes"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={(e) => {
            if (!suggestions.length) return;
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setSIdx((i) => (i + 1) % suggestions.length);
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setSIdx((i) => (i - 1 + suggestions.length) % suggestions.length);
            } else if (e.key === 'Enter') {
              onSearch(suggestions[sIdx].name);
              setFocused(false);
            }
          }}
        />
        {search && (
          <button type="button" className="search-clear" onClick={() => onSearch('')} aria-label="Limpar pesquisa">
            ×
          </button>
        )}
        {focused && suggestions.length > 0 && (
          <ul className="nav-pop suggest" role="listbox">
            {suggestions.map((s, i) => (
              <li key={s.id} role="option" aria-selected={i === sIdx}>
                <button
                  type="button"
                  className={i === sIdx ? 'on' : ''}
                  onMouseEnter={() => setSIdx(i)}
                  onClick={() => {
                    onSearch(s.name);
                    setFocused(false);
                  }}
                >
                  <b>{s.name}</b>
                  <span>{s.keywords.join(', ')}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="seg" role="group" aria-label="Período" style={{ ['--i' as string]: PERIODS.indexOf(period), ['--n' as string]: PERIODS.length }}>
        <span className="seg-pill" aria-hidden="true" />
        {PERIODS.map((p) => (
          <button key={p} type="button" className={p === period ? 'on' : ''} aria-pressed={p === period} onClick={() => onPeriod(p)}>
            {p}
          </button>
        ))}
      </div>
      <select className="period-select" aria-label="Período" value={period} onChange={(e) => onPeriod(e.target.value as Period)}>
        {PERIODS.map((p) => (
          <option key={p} value={p}>
            {PERIOD_LABEL[p]}
          </option>
        ))}
      </select>

      <div className="spacer" />

      <span className="demo-chip" title="Os valores exibidos são simulados">
        Dados de demonstração
      </span>

      <div className="topbar-actions">
        <div ref={bellRef} className="pop-anchor">
          <button type="button" className="icon-btn" aria-label="Notificações" aria-expanded={panel === 'notif'} onClick={() => toggle('notif')}>
            <IconBell />
            <span className="ping" aria-hidden="true" />
          </button>
          {panel === 'notif' && (
            <div className="nav-pop pop empty" role="dialog" aria-label="Notificações">
              <b>Notificações</b>
              <span>Nenhuma notificação por enquanto.</span>
            </div>
          )}
        </div>
        <div ref={msgRef} className="pop-anchor">
          <button type="button" className="icon-btn" aria-label="Mensagens" aria-expanded={panel === 'msg'} onClick={() => toggle('msg')}>
            <IconMessage />
          </button>
          {panel === 'msg' && (
            <div className="nav-pop pop empty" role="dialog" aria-label="Mensagens">
              <b>Mensagens</b>
              <span>Sua caixa de entrada está vazia.</span>
            </div>
          )}
        </div>

        <div ref={userRef} className="pop-anchor">
          <button type="button" className={`user-btn ${panel === 'user' ? 'on' : ''}`} aria-expanded={panel === 'user'} aria-haspopup="menu" onClick={() => toggle('user')}>
            <span className="avatar">
              <IconUser />
            </span>
            <span className="user-txt">
              <b>{user.name}</b>
              <em>Premium</em>
            </span>
            <IconChevron className="user-chev" />
          </button>
          {panel === 'user' && (
            <div className="nav-pop pop menu" role="menu">
              <div className="pop-id">
                <b>{user.name}</b>
                {user.email && <span>{user.email}</span>}
              </div>
              <button type="button" role="menuitem" onClick={() => setPanel(null)}>
                <IconUser /> Meu Perfil
              </button>
              <button type="button" role="menuitem" onClick={() => setPanel(null)}>
                <IconSettings size={18} /> Configurações
              </button>
              <button
                type="button"
                role="menuitem"
                className="danger"
                onClick={() => {
                  setUser((u) => ({ ...u, logged: !u.logged }));
                  setPanel(null);
                }}
              >
                <IconLogout /> {user.logged ? 'Logout' : 'Login'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
