// ================================================================
// REPLACE your entire src/pages/Dashboard.jsx with this file
// Changes: fetches real portfolio, market data, and news from backend
// ================================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, BriefcaseBusiness, Star, Bell, BarChart3, ArrowRight } from 'lucide-react';
import { Card, StatCard, SectionHeader, StockRow, Badge } from '../components/ui';
import { PortfolioLineChart, PortfolioPieChart } from '../components/charts';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Fallback static data while API loads or if it fails
import {
  topGainers, topLosers, watchlistItems, newsItems,
  generatePortfolioHistory, portfolioAllocation, dashboardStats,
} from '../data/mockData';

function IndexCard({ name, value, change }) {
  const isUp = change >= 0;
  return (
    <div className="bg-bg-tertiary border border-bg-border rounded-lg p-3 flex items-center justify-between">
      <div>
        <p className="text-xs text-text-muted mb-0.5">{name}</p>
        <p className="font-mono font-bold text-sm text-text-primary">
          {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
        </p>
      </div>
      <div className={`flex items-center gap-1 text-xs font-mono font-semibold ${isUp ? 'text-accent-green' : 'text-accent-red'}`}>
        {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {isUp ? '+' : ''}{Number(change).toFixed(2)}%
      </div>
    </div>
  );
}

function MiniNewsCard({ item }) {
  const sv = { bullish: 'green', bearish: 'red', neutral: 'yellow' }[item.sentiment] || 'default';
  return (
    <div className="py-3 border-b border-bg-border last:border-0 -mx-4 px-4 cursor-pointer hover:bg-bg-tertiary/50 transition-all rounded-lg group">
      <div className="flex items-start gap-2 mb-1.5">
        <Badge variant={sv} className="shrink-0 mt-0.5 capitalize">{item.sentiment}</Badge>
        <Badge variant="default" className="shrink-0 mt-0.5">{item.category}</Badge>
      </div>
      <p className="text-sm font-medium text-text-primary leading-snug mb-1 group-hover:text-accent-cyan transition-colors">
        {item.title}
      </p>
      <div className="flex items-center gap-3 text-xs text-text-muted">
        <span>{item.source}</span><span>·</span><span>{item.time}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();                    // ← REAL: get logged-in user name

  // State for real API data
  const [portfolio, setPortfolio] = useState(null);
  const [news, setNews] = useState(newsItems);  // fallback to mock
  const [watchlist, setWatchlist] = useState(watchlistItems);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);

  // Static portfolio history for chart (still mock — would need a separate history endpoint)
  const portfolioHistory = generatePortfolioHistory();

  useEffect(() => {
    const fetchDashboard = async () => {
      // Fetch portfolio from backend
      try {
        const data = await api.portfolio.get();    // ← REAL: GET /api/portfolio
        setPortfolio(data.portfolio);
      } catch {
        // Backend not connected yet — silently use mock data
      } finally {
        setLoadingPortfolio(false);
      }

      // Fetch news from backend
      try {
        const newsData = await api.news.get();     // ← REAL: GET /api/news
        if (newsData.news?.length) setNews(newsData.news);
      } catch { /* use mock */ }

      // Fetch watchlist from backend
      try {
        const wlData = await api.watchlist.get();  // ← REAL: GET /api/watchlist
        if (wlData.watchlist?.stocks?.length) setWatchlist(wlData.watchlist.stocks);
      } catch { /* use mock */ }
    };

    fetchDashboard();
  }, []);

  // Use real portfolio if available, otherwise fall back to mock stats
  const portfolioValue = portfolio?.summary?.totalCurrent || dashboardStats.portfolioValue;
  const portfolioChange = portfolio?.summary?.totalPLPercent || dashboardStats.portfolioChange;
  const totalPL = portfolio?.summary?.totalPL || dashboardStats.totalPL;
  const totalPLPct = portfolio?.summary?.totalPLPercent || dashboardStats.totalPLPercent;

  // Compute sector allocation from real holdings if available
  const allocation = portfolio?.holdings?.length
    ? computeAllocation(portfolio.holdings)
    : portfolioAllocation;

  return (
    <div className="space-y-6 page-enter">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-primary">
            Good morning, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-text-secondary text-sm mt-1">Here&apos;s what&apos;s happening in the markets today.</p>
        </div>
        <button className="relative p-2.5 bg-bg-secondary border border-bg-border rounded-lg hover:bg-bg-tertiary transition-all">
          <Bell size={18} className="text-text-secondary" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent-red rounded-full" />
        </button>
      </div>

      {/* Market indices — still mock (would need a market data endpoint) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <IndexCard name="Nifty 50" value={dashboardStats.nifty50.value} change={dashboardStats.nifty50.change} />
        <IndexCard name="SENSEX" value={dashboardStats.sensex.value} change={dashboardStats.sensex.change} />
        <IndexCard name="Gold (10g)" value={dashboardStats.gold.value} change={dashboardStats.gold.change} />
        <IndexCard name="USD/INR" value={dashboardStats.dollarInr.value} change={dashboardStats.dollarInr.change} />
      </div>

      {/* Portfolio summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Portfolio Value" value={portfolioValue} change={portfolioChange}
          icon={BriefcaseBusiness} iconColor="text-accent-cyan" prefix="₹" />
        <StatCard label="Total P&L" value={Math.abs(totalPL)} change={totalPLPct}
          icon={TrendingUp} iconColor="text-accent-green" prefix={totalPL >= 0 ? '+₹' : '-₹'} />
        <StatCard label="Watchlist" value={watchlist.length}
          icon={Star} iconColor="text-accent-yellow" />
        <StatCard label="Active Alerts" value={2} icon={Bell} iconColor="text-accent-purple" />
      </div>

      {/* Charts + lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <SectionHeader title="Portfolio Performance" subtitle="Last 6 months"
              action={
                <button onClick={() => navigate('/portfolio')}
                  className="flex items-center gap-1 text-xs text-accent-cyan hover:underline">
                  View details <ArrowRight size={12} />
                </button>
              } />
            <PortfolioLineChart data={portfolioHistory} />
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Card>
              <SectionHeader title="Top Gainers" subtitle="Today" action={<Badge variant="green">NSE/BSE</Badge>} />
              <div className="space-y-0.5">
                {topGainers.map(s => (
                  <StockRow key={s.symbol} {...s} extra={s.volume}
                    onClick={() => navigate(`/company/${s.symbol}`)} />
                ))}
              </div>
            </Card>
            <Card>
              <SectionHeader title="Top Losers" subtitle="Today" action={<Badge variant="red">NSE/BSE</Badge>} />
              <div className="space-y-0.5">
                {topLosers.map(s => (
                  <StockRow key={s.symbol} {...s} extra={s.volume}
                    onClick={() => navigate(`/company/${s.symbol}`)} />
                ))}
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-5">
          <Card>
            <SectionHeader title="Sector Allocation" />
            <PortfolioPieChart data={allocation} />
          </Card>
          <Card>
            <SectionHeader title="Watchlist"
              action={
                <button onClick={() => navigate('/watchlist')} className="text-xs text-accent-cyan hover:underline">
                  View all
                </button>
              } />
            <div className="space-y-0.5">
              {watchlist.slice(0, 4).map(s => (
                <StockRow key={s.symbol} symbol={s.symbol} name={s.name}
                  price={s.currentPrice || s.price || 0}
                  change={s.change || 0}
                  onClick={() => navigate(`/company/${s.symbol}`)} />
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* News */}
      <Card>
        <SectionHeader title="Latest Financial News" subtitle="AI-curated • Sentiment analyzed"
          action={
            <button onClick={() => navigate('/news')}
              className="flex items-center gap-1 text-xs text-accent-cyan hover:underline">
              View all <ArrowRight size={12} />
            </button>
          } />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          {news.slice(0, 4).map((item, i) => (
            <MiniNewsCard key={item.id || i} item={item} />
          ))}
        </div>
      </Card>

      {/* AI CTA */}
      <Card className="bg-gradient-to-r from-accent-cyan/5 to-accent-purple/5 border-accent-cyan/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-semibold text-text-primary text-lg">Ask the AI anything</h3>
            <p className="text-text-secondary text-sm mt-1">
              "Should I invest in TCS?" · "What is EBITDA?" · "Compare Infosys and Wipro"
            </p>
          </div>
          <button onClick={() => navigate('/chat')} className="btn-primary shrink-0 flex items-center gap-2">
            <BarChart3 size={16} /> Open AI Chat
          </button>
        </div>
      </Card>
    </div>
  );
}

// Helper: compute sector allocation from real holdings
function computeAllocation(holdings) {
  const total = holdings.reduce((acc, h) => acc + (h.currentValue || h.quantity * h.averagePrice), 0);
  const sectorMap = {};
  holdings.forEach(h => {
    const val = h.currentValue || h.quantity * h.averagePrice;
    sectorMap[h.sector || 'Other'] = (sectorMap[h.sector || 'Other'] || 0) + val;
  });
  const colors = ['#00D4FF', '#7B61FF', '#00E676', '#FFB800', '#FF3B5C', '#F0F4FF'];
  return Object.entries(sectorMap).map(([name, val], i) => ({
    name,
    value: parseFloat(((val / total) * 100).toFixed(1)),
    color: colors[i % colors.length],
  }));
}
