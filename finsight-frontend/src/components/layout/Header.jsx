// Header.jsx — market ticker, search and market status

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { isMarketOpen } from '../../lib/format';
import { motion } from 'framer-motion';

const CACHE_KEY = 'finsight:ticker';
const CACHE_MS = 5 * 60 * 1000;

function readCache() {
  try {
    const c = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
    if (c && Date.now() - c.at < CACHE_MS) return c.items;
  } catch { /* ignore corrupt cache */ }
  return null;
}

// Live indices + the biggest NSE stocks from one backend call. If it can't be fetched we render
// nothing rather than showing made-up prices.
function MarketTicker() {
  const [items, setItems] = useState(() => readCache() || []);

  useEffect(() => {
    if (items.length) return undefined;
    let cancelled = false;
    api.market.overview()
      .then((res) => {
        const next = res.ticker || [];
        if (cancelled || !next.length) return;
        setItems(next);
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), items: next })); } catch { /* storage unavailable */ }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [items.length]);

  if (!items.length) return <div className="h-[33px] border-b border-bg-border bg-bg-secondary/80" aria-hidden="true" />;

  const doubled = [...items, ...items];
  return (
    <div className="bg-bg-secondary/80 border-b border-bg-border py-2 ticker-wrap" aria-label="Market ticker">
      <div className="ticker-content gap-8">
        {doubled.map((s, i) => (
          <div key={i} className="flex items-center gap-2 shrink-0" aria-hidden={i >= items.length}>
            <span className="font-mono text-xs text-text-secondary font-semibold">{s.symbol}</span>
            <span className="font-mono text-xs text-text-primary">{s.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            <span className={`text-xs font-mono ${s.change >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
              {s.change >= 0 ? '+' : ''}{s.change.toFixed(2)}%
            </span>
            <span className="text-bg-border">|</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Header({ toggleSidebar, onSearch }) {
  const [query, setQuery] = useState('');
  const [mobileSearch, setMobileSearch] = useState(false);
  const [open, setOpen] = useState(() => isMarketOpen());
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setOpen(isMarketOpen()), 60_000);
    return () => clearInterval(t);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/company/${encodeURIComponent(q.toUpperCase())}`);
    setQuery('');
    setMobileSearch(false);
  };

  const searchForm = (
    <form onSubmit={handleSearch} className="relative w-full" role="search">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
      <input
        type="text"
        aria-label="Search for a stock symbol"
        placeholder="Search a symbol, e.g. TCS or INFY"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="input-field pl-9 pr-9 text-sm h-9"
        autoFocus={mobileSearch}
      />
      {mobileSearch && (
        <button type="button" onClick={() => setMobileSearch(false)} aria-label="Close search" className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
          <X size={14} />
        </button>
      )}
    </form>
  );

  return (
    <header className="sticky top-0 z-20 bg-bg-primary/80 backdrop-blur-md">
      <MarketTicker />

      <div className="border-b border-bg-border px-4 py-3 flex items-center gap-4">
        <button onClick={toggleSidebar} aria-label="Open menu" className="lg:hidden text-text-secondary hover:text-text-primary transition-colors">
          <Menu size={22} />
        </button>

        <div className="flex-1 max-w-md mx-auto">
          <div className="hidden lg:block">{searchForm}</div>
          <div className="lg:hidden flex justify-end">
            {mobileSearch ? searchForm : (
              <button onClick={() => setMobileSearch(true)} aria-label="Search" className="p-2 text-text-secondary hover:text-text-primary">
                <Search size={20} />
              </button>
            )}
          </div>
        </div>

        <button onClick={onSearch} className="hidden xl:flex items-center gap-2 px-2.5 py-1.5 text-xs text-text-muted border border-bg-border rounded-lg hover:text-text-secondary hover:border-accent-primary/30 transition-colors">
          Jump to <kbd className="border border-bg-border rounded px-1 font-mono">⌘K</kbd>
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-bg-secondary border border-bg-border rounded-lg ml-auto lg:ml-0">
          <span className="relative flex w-2 h-2">
            {open && <span className="absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-60 animate-ping" />}
            <span className={`relative inline-flex w-2 h-2 rounded-full ${open ? 'bg-accent-green' : 'bg-text-muted'}`} />
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={open ? 'open' : 'closed'}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-xs text-text-secondary font-medium"
            >
              NSE {open ? 'open' : 'closed'}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
