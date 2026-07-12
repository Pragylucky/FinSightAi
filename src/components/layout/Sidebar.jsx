// Sidebar.jsx
// This is our left navigation panel - always visible on desktop
// On mobile we'll hide it and show a hamburger menu

import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  MessageSquareText,
  BriefcaseBusiness,
  Star,
  Newspaper,
  SlidersHorizontal,
  TrendingUp,
  GraduationCap,
  ChevronRight,
  Zap,
  LogOut,
  Settings,
  Bell,
} from 'lucide-react';

// Navigation items array - easy to add/remove pages
const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/company/TCS', label: 'Company Analysis', icon: Building2 },
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

  const handleLogout = () => {
    // When backend is ready: call logout API, clear tokens
    navigate('/');
  };

  return (
    <>
      {/* Mobile overlay — clicking it closes the sidebar */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40
          w-64 bg-bg-secondary border-r border-bg-border
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="p-5 border-b border-bg-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
            <Zap size={18} className="text-bg-primary" fill="currentColor" />
          </div>
          <div>
            <h1 className="font-display font-bold text-text-primary text-lg leading-tight">
              FinSight
            </h1>
            <p className="text-text-muted text-xs">AI Finance Platform</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <p className="text-text-muted text-xs font-semibold uppercase tracking-wider px-3 mb-3">
            Navigation
          </p>
          
          <ul className="space-y-1">
            {navItems.map(({ path, label, icon: Icon, badge }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  onClick={() => setIsOpen(false)} // close on mobile
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    text-sm font-medium transition-all duration-150
                    group relative
                    ${isActive
                      ? 'nav-active text-accent-cyan'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                    }
                  `}
                >
                  <Icon size={17} className="shrink-0" />
                  <span className="flex-1">{label}</span>
                  
                  {/* Badge (like "AI" on chat) */}
                  {badge && (
                    <span className="text-xs bg-accent-purple/20 text-accent-purple px-1.5 py-0.5 rounded font-mono font-semibold">
                      {badge}
                    </span>
                  )}
                  
                  {/* Active indicator arrow */}
                  <ChevronRight
                    size={14}
                    className="opacity-0 group-[.nav-active]:opacity-100 text-accent-cyan shrink-0"
                  />
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Section — User info + logout */}
        <div className="p-3 border-t border-bg-border space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all">
            <Bell size={17} />
            <span>Notifications</span>
            <span className="ml-auto text-xs bg-accent-red/20 text-accent-red px-1.5 py-0.5 rounded-full font-mono">2</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all">
            <Settings size={17} />
            <span>Settings</span>
          </button>
          
          {/* User Profile */}
          <div className="mt-2 pt-2 border-t border-bg-border flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center text-xs font-bold text-bg-primary">
              R
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">Ronak Singh</p>
              <p className="text-xs text-text-muted truncate">ronak@nsut.ac.in</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-text-muted hover:text-accent-red transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
