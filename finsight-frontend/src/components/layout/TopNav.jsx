// TopNav.jsx — app navigation as a floating top bar (same family as the landing page nav).
// Live ticker on top, a pill nav with a sliding active indicator, a "More" menu for the
// secondary pages, ⌘K search, market status and an account menu. Full-screen sheet on mobile.

import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Building2, MessageSquareText, BriefcaseBusiness, Star, Newspaper, SlidersHorizontal,
  TrendingUp, GraduationCap, Zap, LogOut, Scale, ChevronDown, Search, Menu, X, UserPlus,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import MarketTicker from '../common/MarketTicker';
import { useAuth } from '../../context/AuthContext';
import { isMarketOpen } from '../../lib/format';
import { EASE } from '../../lib/motion';

const PRIMARY = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/company', match: '/company', label: 'Research', icon: Building2 },
  { path: '/compare', label: 'Compare', icon: Scale },
  { path: '/chat', label: 'AI Chat', icon: MessageSquareText, badge: 'AI' },
  { path: '/portfolio', label: 'Portfolio', icon: BriefcaseBusiness },
  { path: '/watchlist', label: 'Watchlist', icon: Star },
];
const MORE = [
  { path: '/news', label: 'News', icon: Newspaper, hint: 'Headlines with sentiment' },
  { path: '/screener', label: 'Screener', icon: SlidersHorizontal, hint: '265 stocks, filters' },
  { path: '/funds', label: 'Mutual funds', icon: TrendingUp, hint: 'NAV returns' },
  { path: '/learn', label: 'Learn', icon: GraduationCap, hint: 'SIP calculator, glossary' },
];
const ALL = [...PRIMARY, ...MORE];

const spring = { type: 'spring', stiffness: 420, damping: 34 };

// Closes a popover when you click outside it or press Escape
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

function Pill({ item, active }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      title={item.label}
      className={`relative flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-150 ${active ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
    >
      {active && (
        <motion.span
          layoutId="topnav-pill"
          className="absolute inset-0 rounded-full bg-accent-primary/15 border border-accent-primary/40 shadow-[0_0_18px_rgb(var(--c-primary)/0.25)]"
          transition={spring}
        />
      )}
      <Icon size={15} className={`relative ${active ? 'text-accent-primary' : ''}`} />
      <span className="relative hidden xl:inline">{item.label}</span>
      {item.badge && <span className="relative text-[10px] leading-none bg-accent-secondary/20 text-accent-secondary px-1.5 py-1 rounded font-mono font-semibold">{item.badge}</span>}
    </NavLink>
  );
}

export default function TopNav({ onSearch }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  // Each menu remembers the page it was opened on, so navigating closes it without an effect
  const [moreAt, setMoreAt] = useState(null);
  const [userAt, setUserAt] = useState(null);
  const [sheetAt, setSheetAt] = useState(null);
  const moreOpen = moreAt === pathname;
  const userOpen = userAt === pathname;
  const sheet = sheetAt === pathname;
  const setMoreOpen = (v) => setMoreAt((cur) => ((typeof v === 'function' ? v(cur === pathname) : v) ? pathname : null));
  const setUserOpen = (v) => setUserAt((cur) => ((typeof v === 'function' ? v(cur === pathname) : v) ? pathname : null));
  const setSheet = (v) => setSheetAt((cur) => ((typeof v === 'function' ? v(cur === pathname) : v) ? pathname : null));
  const [scrolled, setScrolled] = useState(false);
  const [marketOpen, setMarketOpen] = useState(() => isMarketOpen());

  const moreRef = useDismiss(moreOpen, () => setMoreOpen(false));
  const userRef = useDismiss(userOpen, () => setUserOpen(false));

  const isActive = (item) => (item.match ? pathname.startsWith(item.match) : pathname === item.path);
  const moreActive = MORE.find(isActive);

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

      <div className={`border-b transition-all duration-300 ${scrolled ? 'bg-bg-primary/90 border-bg-border shadow-lg shadow-black/30' : 'bg-bg-primary/60 border-transparent'} backdrop-blur-xl`}>
        <div className="max-w-[88rem] mx-auto px-4 lg:px-8 h-16 flex items-center gap-4">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0 group" aria-label="FinSight home">
            <motion.div
              whileHover={{ rotate: -8, scale: 1.06 }}
              transition={{ type: 'spring', stiffness: 400, damping: 14 }}
              className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-lg shadow-accent-primary/25"
            >
              <Zap size={17} className="text-white" fill="currentColor" />
            </motion.div>
            <span className="font-display font-bold text-lg text-text-primary hidden sm:block">FinSight <span className="text-accent-primary">AI</span></span>
          </Link>

          {/* Desktop pill nav */}
          <nav aria-label="Primary" className="hidden lg:flex flex-1 justify-center">
            <div className="flex items-center gap-0.5 rounded-full border border-bg-border bg-bg-secondary/70 p-1 backdrop-blur">
              {PRIMARY.map((item) => <Pill key={item.path} item={item} active={isActive(item)} />)}

              <div className="relative" ref={moreRef}>
                <button
                  onClick={() => setMoreOpen((o) => !o)}
                  aria-expanded={moreOpen}
                  aria-haspopup="menu"
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${moreActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  {moreActive && (
                    <motion.span layoutId="topnav-pill" className="absolute inset-0 rounded-full bg-accent-primary/15 border border-accent-primary/40 shadow-[0_0_18px_rgb(var(--c-primary)/0.25)]" transition={spring} />
                  )}
                  <span className="relative">{moreActive ? moreActive.label : 'More'}</span>
                  <ChevronDown size={14} className={`relative transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {moreOpen && (
                    <motion.div
                      role="menu"
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.18, ease: EASE }}
                      className="absolute right-0 top-[calc(100%+10px)] w-64 rounded-xl border border-bg-border bg-bg-secondary p-1.5 shadow-2xl shadow-black/50 origin-top-right"
                    >
                      {MORE.map(({ path, label, icon: Icon, hint }, i) => (
                        <motion.div key={path} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 + i * 0.04 }}>
                          <NavLink
                            to={path}
                            role="menuitem"
                            className={({ isActive: a }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${a ? 'bg-accent-primary/10 text-accent-primary' : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'}`}
                          >
                            <span className="w-8 h-8 rounded-lg bg-bg-tertiary flex items-center justify-center shrink-0"><Icon size={15} /></span>
                            <span>
                              <span className="block text-sm font-medium text-text-primary">{label}</span>
                              <span className="block text-xs text-text-muted">{hint}</span>
                            </span>
                          </NavLink>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </nav>

          <div className="flex-1 lg:hidden" />

          {/* Right cluster */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onSearch}
              aria-label="Search stocks and pages"
              className="flex items-center gap-2 h-9 px-3 rounded-full border border-bg-border bg-bg-secondary/70 text-text-muted hover:text-text-primary hover:border-accent-primary/40 transition-colors"
            >
              <Search size={15} />
              <span className="hidden 2xl:inline text-xs">Search</span>
              <kbd className="hidden xl:inline text-[10px] font-mono border border-bg-border rounded px-1.5 py-0.5">⌘K</kbd>
            </button>

            <div className="hidden md:flex items-center gap-2 h-9 px-3 rounded-full border border-bg-border bg-bg-secondary/70" aria-label={`NSE ${marketOpen ? 'open' : 'closed'}`}>
              <span className="relative flex w-2 h-2">
                {marketOpen && <span className="absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-60 animate-ping" />}
                <span className={`relative inline-flex w-2 h-2 rounded-full ${marketOpen ? 'bg-accent-green' : 'bg-text-muted'}`} />
              </span>
              <span className="text-xs font-medium text-text-secondary">NSE {marketOpen ? 'open' : 'closed'}</span>
            </div>

            {/* Account menu */}
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setUserOpen((o) => !o)}
                aria-label="Account menu"
                aria-expanded={userOpen}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-sm font-bold text-white ring-2 ring-transparent hover:ring-accent-primary/40 transition-shadow"
              >
                {initial}
              </button>
              <AnimatePresence>
                {userOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
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

            <button onClick={() => setSheet((o) => !o)} aria-label={sheet ? 'Close menu' : 'Open menu'} aria-expanded={sheet} className="lg:hidden w-9 h-9 rounded-full border border-bg-border bg-bg-secondary/70 flex items-center justify-center text-text-secondary">
              {sheet ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sheet */}
      <AnimatePresence>
        {sheet && (
          <motion.nav
            aria-label="Mobile"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="lg:hidden absolute inset-x-0 top-full border-b border-bg-border bg-bg-primary/95 backdrop-blur-xl p-4 shadow-2xl shadow-black/50 max-h-[calc(100vh-110px)] overflow-y-auto"
          >
            <div className="grid grid-cols-2 gap-2.5">
              {ALL.map((item, i) => {
                const Icon = item.icon;
                const active = isActive(item);
                return (
                  <motion.div key={item.path} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i, duration: 0.25 }}>
                    <NavLink to={item.path} className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-sm font-medium transition-colors ${active ? 'border-accent-primary/50 bg-accent-primary/10 text-accent-primary' : 'border-bg-border bg-bg-secondary text-text-secondary'}`}>
                      <Icon size={17} />
                      {item.label}
                    </NavLink>
                  </motion.div>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
