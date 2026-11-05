// Header.jsx — market ticker, search and market status

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import MarketTicker from '../common/MarketTicker';
import { isMarketOpen } from '../../lib/format';
import { motion } from 'framer-motion';

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
