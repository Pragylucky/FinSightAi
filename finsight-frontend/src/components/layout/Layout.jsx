// Layout.jsx — authenticated shell: sidebar + header + animated page outlet

import { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import CommandPalette from './CommandPalette';
import { useAuth } from '../../context/AuthContext';
import { PageTransition } from '../motion';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const location = useLocation();

  // Cmd/Ctrl+K opens the palette from anywhere
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Tab title follows the page
  useEffect(() => {
    const names = { dashboard: 'Dashboard', chat: 'AI Chat', portfolio: 'Portfolio', watchlist: 'Watchlist', news: 'News', screener: 'Screener', funds: 'Mutual Funds', learn: 'Learn', company: 'Company', compare: 'Compare' };
    const seg = location.pathname.split('/')[1];
    const raw = location.pathname.split('/')[2];
    const sym = seg === 'company' && raw ? ` · ${decodeURIComponent(raw)}` : '';
    document.title = `${names[seg] || 'FinSight'}${sym} — FinSight AI`;
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="min-h-screen bg-bg-primary relative">
      <div className="app-bg" aria-hidden="true" />
      <div className="aurora aurora-a" aria-hidden="true" />
      <div className="aurora aurora-b" aria-hidden="true" />
      <div className="aurora aurora-c" aria-hidden="true" />

      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="relative z-10 lg:ml-64 flex flex-col min-h-screen min-w-0">
        <Header toggleSidebar={() => setSidebarOpen((o) => !o)} onSearch={() => setPaletteOpen(true)} />

        <main className="flex-1 min-w-0 overflow-x-hidden p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
