// Layout.jsx
// Wraps all authenticated pages with sidebar + header
// Think of it as the "shell" of the app

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  // Controls sidebar open/close on mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Sidebar — fixed on desktop, toggleable on mobile */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main content area — shifted right on desktop to avoid sidebar overlap */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Sticky header at the top */}
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page content — Outlet renders whatever page we're on */}
        <main className="flex-1 overflow-auto p-4 lg:p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
