// Cmd/Ctrl+K palette: jump to any page, or type a symbol to open that company.

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, CornerDownLeft, LayoutDashboard, MessageSquareText, BriefcaseBusiness, Star, Newspaper, SlidersHorizontal, TrendingUp, GraduationCap, Building2 } from 'lucide-react';
import { EASE } from '../../lib/motion';

const PAGES = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'AI Chat', to: '/chat', icon: MessageSquareText },
  { label: 'Portfolio', to: '/portfolio', icon: BriefcaseBusiness },
  { label: 'Watchlist', to: '/watchlist', icon: Star },
  { label: 'Financial News', to: '/news', icon: Newspaper },
  { label: 'Stock Screener', to: '/screener', icon: SlidersHorizontal },
  { label: 'Mutual Funds', to: '/funds', icon: TrendingUp },
  { label: 'Learning', to: '/learn', icon: GraduationCap },
];

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const input = useRef(null);

  const items = useMemo(() => {
    const q = query.trim();
    const pages = PAGES.filter((p) => p.label.toLowerCase().includes(q.toLowerCase()));
    const symbol = q && /^[a-z0-9.&-]{1,15}$/i.test(q)
      ? [{ label: `Open ${q.toUpperCase()}`, hint: 'Company analysis', to: `/company/${encodeURIComponent(q.toUpperCase())}`, icon: Building2 }]
      : [];
    return [...symbol, ...pages];
  }, [query]);

  useEffect(() => {
    if (!open) return undefined;
    const t = setTimeout(() => input.current?.focus(), 30);
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => { clearTimeout(t); document.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  const go = (item) => {
    if (!item) return;
    navigate(item.to);
    setQuery('');
    setActive(0);
    onClose();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, items.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); go(items[active]); }
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            role="dialog" aria-modal="true" aria-label="Command palette"
            className="w-full max-w-lg rounded-2xl border border-bg-border bg-bg-secondary shadow-2xl shadow-black/60 overflow-hidden"
            initial={{ opacity: 0, y: -16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: EASE }}
          >
            <div className="flex items-center gap-3 px-4 border-b border-bg-border">
              <Search size={16} className="text-text-muted" />
              <input
                ref={input}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActive(0); }}
                onKeyDown={onKeyDown}
                aria-label="Search pages or enter a stock symbol"
                placeholder="Go to a page, or type a symbol…"
                className="flex-1 h-12 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
              />
              <kbd className="text-[10px] text-text-muted border border-bg-border rounded px-1.5 py-0.5">Esc</kbd>
            </div>
            <ul className="max-h-72 overflow-y-auto p-2">
              {items.length === 0 && <li className="px-3 py-6 text-center text-sm text-text-muted">Nothing found</li>}
              {items.map((item, i) => (
                <li key={item.to}>
                  <button
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(item)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${i === active ? 'bg-accent-primary/10 text-accent-primary' : 'text-text-secondary'}`}
                  >
                    <item.icon size={16} />
                    <span className="flex-1">{item.label}</span>
                    {item.hint && <span className="text-xs text-text-muted">{item.hint}</span>}
                    {i === active && <CornerDownLeft size={13} />}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
