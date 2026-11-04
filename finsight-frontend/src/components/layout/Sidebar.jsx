// Sidebar.jsx — left navigation. Fixed on desktop, slide-over drawer on mobile.

import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, MessageSquareText, BriefcaseBusiness, Star, Newspaper, SlidersHorizontal, TrendingUp, GraduationCap, Zap, LogOut, Settings } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../ui';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/company/TCS', match: '/company', label: 'Company Analysis', icon: Building2 },
  { path: '/chat', label: 'AI Chat', icon: MessageSquareText, badge: 'AI' },
  { path: '/portfolio', label: 'Portfolio', icon: BriefcaseBusiness },
  { path: '/watchlist', label: 'Watchlist', icon: Star },
  { path: '/news', label: 'Financial News', icon: Newspaper },
  { path: '/screener', label: 'Stock Screener', icon: SlidersHorizontal },
  { path: '/funds', label: 'Mutual Funds', icon: TrendingUp },
  { path: '/learn', label: 'Learning', icon: GraduationCap },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const { pathname } = useLocation();
  const isActive = (path, match) => (match ? pathname.startsWith(match) : pathname === path);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initial = (user?.name || user?.email || 'U').trim()[0]?.toUpperCase();

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        aria-label="Primary"
        className={`fixed top-0 left-0 h-full z-40 w-64 bg-bg-secondary/95 backdrop-blur border-r border-bg-border flex flex-col transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="p-5 border-b border-bg-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-lg shadow-accent-primary/20">
            <Zap size={18} className="text-bg-primary" fill="currentColor" />
          </div>
          <div>
            <p className="font-display font-bold text-text-primary text-lg leading-tight">FinSight</p>
            <p className="text-text-muted text-xs">AI Finance Platform</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <p className="text-text-muted text-xs font-semibold uppercase tracking-wider px-3 mb-3">Navigation</p>
          <ul className="space-y-1">
            {navItems.map(({ path, match, label, icon: Icon, badge }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  onClick={() => setIsOpen(false)}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isActive(path, match) ? 'text-accent-primary' : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                  }`}
                >
                  {isActive(path, match) && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-lg nav-active border-l-2 border-accent-primary"
                      transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                    />
                  )}
                  <Icon size={17} className="relative shrink-0" />
                  <span className="relative flex-1">{label}</span>
                  {badge && (
                    <span className="relative text-xs bg-accent-secondary/20 text-accent-secondary px-1.5 py-0.5 rounded font-mono font-semibold">
                      {badge}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-3 border-t border-bg-border space-y-1">
          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
          >
            <Settings size={17} />
            <span>Account</span>
          </button>

          <div className="mt-2 pt-2 border-t border-bg-border flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-xs font-bold text-bg-primary shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-text-muted truncate">{user?.isGuest ? 'Guest session' : user?.email || ''}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md text-text-muted hover:text-accent-red hover:bg-accent-red/10 transition-colors"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <Modal open={showSettings} onClose={() => setShowSettings(false)} title="Account" maxWidth="max-w-md">
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg bg-bg-tertiary p-4">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center font-bold text-bg-primary">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-text-primary truncate">{user?.name}</p>
              <p className="text-sm text-text-muted truncate">{user?.isGuest ? 'Guest session' : user?.email}</p>
            </div>
          </div>
          {user?.isGuest && (
            <p className="text-xs text-text-muted leading-relaxed">
              Guest data is deleted after 7 days. <button onClick={async () => { await logout(); navigate('/signup'); }} className="text-accent-primary hover:underline">Create an account</button> for a permanent one.
            </p>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-accent-red/10 py-3 font-semibold text-accent-red hover:bg-accent-red/20 transition-colors"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </Modal>
    </>
  );
}
