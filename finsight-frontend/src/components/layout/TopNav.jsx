// TopNav.jsx — slim app header: live ticker, logo, current page, ⌘K search, market status, account menu.
// Page-to-page navigation lives in the floating Dock.

import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Zap, LogOut, Search, UserPlus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import MarketTicker from '../common/MarketTicker';
import { PAGES } from '../../lib/pages';
import { useAuth } from '../../context/AuthContext';
import { isMarketOpen } from '../../lib/format';
import { EASE } from '../../lib/motion';

function useDismiss(open, close) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) close(); };
    const onKey = (e) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open, close]);
  return ref;
}

export default function TopNav({ onSearch }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [userAt, setUserAt] = useState(null);       // remembers the page the menu was opened on, so navigating closes it
  const [scrolled, setScrolled] = useState(false);
  const [marketOpen, setMarketOpen] = useState(() => isMarketOpen());
  const userOpen = userAt === pathname;
  const userRef = useDismiss(userOpen, () => setUserAt(null));

  const page = PAGES.find((p) => (p.match ? pathname.startsWith(p.match) : pathname === p.path));
  const PageIcon = page?.icon;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setMarketOpen(isMarketOpen()), 60_000);
    return () => clearInterval(t);
  }, []);

  const initial = (user?.name || user?.email || 'U').trim()[0]?.toUpperCase();
  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <header className="sticky top-0 z-40">
      <MarketTicker />

      <div className={`border-b transition-all duration-300 backdrop-blur-xl ${scrolled ? 'bg-bg-primary/85 border-bg-border' : 'bg-transparent border-transparent'}`}>
        <div className="max-w-[88rem] mx-auto px-4 lg:px-8 h-14 flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0" aria-label="FinSight home">
            <motion.div
              whileHover={{ rotate: -8, scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 400, damping: 14 }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-lg shadow-accent-primary/30"
            >
              <Zap size={15} className="text-white" fill="currentColor" />
            </motion.div>
            <span className="font-display font-bold text-lg text-text-primary hidden sm:block">FinSight <span className="text-accent-primary">AI</span></span>
          </Link>

          {/* Current page, swapped with a slide */}
          <div className="hidden md:flex items-center gap-2 pl-4 ml-1 border-l border-bg-border h-6 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={page?.label || 'x'}
                initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }}
                transition={{ duration: 0.22, ease: EASE }}
                className="flex items-center gap-2 text-sm text-text-secondary"
              >
                {PageIcon && <PageIcon size={14} className="text-accent-primary" />}
                {page?.label}
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="flex-1" />

          <button
            onClick={onSearch}
            aria-label="Search stocks and pages"
            className="group flex items-center gap-2.5 h-9 pl-3 pr-2 rounded-full border border-bg-border bg-bg-secondary/70 text-text-muted hover:text-text-primary hover:border-accent-primary/50 hover:shadow-[0_0_20px_rgb(var(--c-primary)/0.2)] transition-all"
          >
            <Search size={15} />
            <span className="hidden sm:inline text-xs">Search stocks or pages</span>
            <kbd className="hidden sm:inline text-[10px] font-mono border border-bg-border rounded px-1.5 py-0.5 group-hover:border-accent-primary/40">⌘K</kbd>
          </button>

          <div className="hidden md:flex items-center gap-2 h-9 px-3 rounded-full border border-bg-border bg-bg-secondary/70" aria-label={`NSE ${marketOpen ? 'open' : 'closed'}`}>
            <span className="relative flex w-2 h-2">
              {marketOpen && <span className="absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-60 animate-ping" />}
              <span className={`relative inline-flex w-2 h-2 rounded-full ${marketOpen ? 'bg-accent-green' : 'bg-text-muted'}`} />
            </span>
            <span className="text-xs font-medium text-text-secondary">NSE {marketOpen ? 'open' : 'closed'}</span>
          </div>

          <div className="relative" ref={userRef}>
            <button
              onClick={() => setUserAt(userOpen ? null : pathname)}
              aria-label="Account menu"
              aria-expanded={userOpen}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-sm font-bold text-white ring-2 ring-transparent hover:ring-accent-primary/40 transition-shadow"
            >
              {initial}
            </button>
            <AnimatePresence>
              {userOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: EASE }}
                  className="absolute right-0 top-[calc(100%+10px)] w-64 rounded-xl border border-bg-border bg-bg-secondary p-2 shadow-2xl shadow-black/50 origin-top-right"
                >
                  <div className="px-3 py-3">
                    <p className="text-sm font-semibold text-text-primary truncate">{user?.name || 'User'}</p>
                    <p className="text-xs text-text-muted truncate">{user?.isGuest ? 'Guest session · deleted after 7 days' : user?.email}</p>
                  </div>
                  {user?.isGuest && (
                    <button onClick={async () => { await logout(); navigate('/signup'); }} className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-accent-primary hover:bg-accent-primary/10 transition-colors">
                      <UserPlus size={15} /> Create a permanent account
                    </button>
                  )}
                  <button onClick={handleLogout} className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-text-secondary hover:text-accent-red hover:bg-accent-red/10 transition-colors">
                    <LogOut size={15} /> Log out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
