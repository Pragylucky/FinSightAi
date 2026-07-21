// Header.jsx
// Top bar with: hamburger menu (mobile), market ticker, search, notifications

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, X } from 'lucide-react';
import { tickerStocks } from '../../data/mockData';

// ChangeChip — little green/red pill showing stock change
function ChangeChip({ change }) {
  const isPositive = change >= 0;
  return (
    <span className={`text-xs font-mono ${isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
      {isPositive ? '+' : ''}{change.toFixed(2)}%
    </span>
  );
}

// MarketTicker — the scrolling prices bar at the top
function MarketTicker() {
  // We duplicate the array so the scroll looks seamless (infinite loop trick)
  const doubled = [...tickerStocks, ...tickerStocks];

  return (
    <div className="bg-bg-secondary border-b border-bg-border py-2 overflow-hidden ticker-wrap">
      <div className="ticker-content flex gap-8">
        {doubled.map((stock, i) => (
          <div key={i} className="flex items-center gap-2 shrink-0">
            <span className="font-mono text-xs text-text-secondary font-semibold">{stock.symbol}</span>
            <span className="font-mono text-xs text-text-primary">{stock.price.toLocaleString('en-IN')}</span>
            <ChangeChip change={stock.change} />
            <span className="text-bg-border">|</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Header({ toggleSidebar }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const notificationCount = 0;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to company page with the searched symbol
      navigate(`/company/${searchQuery.trim().toUpperCase()}`);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-bg-primary/95 backdrop-blur-sm">
      {/* Market Ticker */}
      <MarketTicker />

      {/* Main Header Bar */}
      <div className="border-b border-bg-border px-4 py-3 flex items-center gap-4">
        {/* Hamburger — only visible on mobile */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden text-text-secondary hover:text-text-primary transition-colors"
        >
          <Menu size={22} />
        </button>

        {/* Page title area — on desktop we pad to account for sidebar */}
        <div className="hidden lg:block text-text-muted text-sm">
          {/* This space is intentionally blank — sidebar handles branding */}
        </div>

        {/* Search — expands on mobile when icon clicked */}
        <div className="flex-1 max-w-md mx-auto">
          {showSearch || window.innerWidth >= 1024 ? (
            <form onSubmit={handleSearch} className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search stocks, ETFs, mutual funds... (e.g. TCS, INFY)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-9 pr-4 text-sm h-9"
                autoFocus={showSearch}
              />
              {showSearch && (
                <button
                  type="button"
                  onClick={() => setShowSearch(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                >
                  <X size={14} />
                </button>
              )}
            </form>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="lg:hidden text-text-secondary hover:text-text-primary"
            >
              <Search size={20} />
            </button>
          )}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 ml-auto lg:ml-0">
          {/* Notifications bell */}
          <button
            onClick={() => setShowNotifications(true)}
            className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-all"
          >
            <Bell size={18} />
            {/* Red dot for unread notifications */}
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-red rounded-full"></span>
            )}
          </button>

          {/* Market status indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-bg-secondary border border-bg-border rounded-lg">
            <span className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></span>
            <span className="text-xs text-text-secondary font-medium">Market Open</span>
          </div>
        </div>
      </div>
    </header>
  );
}
