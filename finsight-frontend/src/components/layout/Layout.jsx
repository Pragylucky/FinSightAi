// Layout.jsx
// Wraps all authenticated pages with sidebar + header
// Think of it as the "shell" of the app

import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';

export default function Layout() {
  // Controls sidebar open/close on mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  if (loading) {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

if (!user) {
  return <Navigate to="/login" replace />;
}

  return (
  <div className="min-h-screen bg-bg-primary">      {
    /* Sidebar — fixed on desktop, toggleable on mobile */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main content area — shifted right on desktop to avoid sidebar overlap */}
      <div className="lg:ml-64 flex flex-col min-h-screen min-w-0">
        {/* Sticky header at the top */}
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page content — Outlet renders whatever page we're on */}
        <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto p-4 lg:p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
