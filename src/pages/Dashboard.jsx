// Dashboard.jsx
// Main dashboard page — first thing you see after logging in
// Shows: portfolio summary, market indices, gainers/losers, news, watchlist

import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, BriefcaseBusiness, Star,
  Newspaper, ArrowRight, DollarSign, BarChart3, Bell,
} from 'lucide-react';
import {
  Card, StatCard, SectionHeader, StockRow, Badge, ChangeBadge,
} from '../components/ui';
import {
  dashboardStats, topGainers, topLosers, newsItems, watchlistItems,
  generatePortfolioHistory, portfolioAllocation,
} from '../data/mockData';
import { PortfolioLineChart, PortfolioPieChart } from '../components/charts';

// Mini news card
function MiniNewsCard({ item }) {
  const sentimentVariant = {
    bullish: 'green',
    bearish: 'red',
    neutral: 'yellow',
  }[item.sentiment] || 'default';

  return (
    <div className="py-3 border-b border-bg-border last:border-0 hover:bg-bg-tertiary/50 -mx-4 px-4 cursor-pointer transition-all rounded-lg group">
      <div className="flex items-start gap-2 mb-1.5">
        <Badge variant={sentimentVariant} className="shrink-0 mt-0.5 capitalize">
          {item.sentiment}
        </Badge>
        <Badge variant="default" className="shrink-0 mt-0.5">{item.category}</Badge>
      </div>
      <p className="text-sm font-medium text-text-primary leading-snug mb-1 group-hover:text-accent-cyan transition-colors">
        {item.title}
      </p>
      <div className="flex items-center gap-3 text-xs text-text-muted">
        <span>{item.source}</span>
        <span>·</span>
        <span>{item.time}</span>
      </div>
    </div>
  );
}

// Market index mini card
function IndexCard({ name, value, change }) {
  const isUp = change >= 0;
  return (
    <div className="bg-bg-tertiary border border-bg-border rounded-lg p-3 flex items-center justify-between">
      <div>
        <p className="text-xs text-text-muted mb-0.5">{name}</p>
        <p className="font-mono font-bold text-sm text-text-primary">{value.toLocaleString('en-IN')}</p>
      </div>
      <div className={`flex items-center gap-1 text-xs font-mono font-semibold ${isUp ? 'text-accent-green' : 'text-accent-red'}`}>
        {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {isUp ? '+' : ''}{change}%
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const portfolioHistory = generatePortfolioHistory();
  const { portfolioValue, portfolioChange, totalPL, totalPLPercent, nifty50, sensex, gold, dollarInr } = dashboardStats;

  return (
    <div className="space-y-6 page-enter">
      {/* ── GREETING ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-primary">
            Good morning, Ronak 👋
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Here&apos;s what&apos;s happening in the markets today.
          </p>
        </div>
        <button className="relative p-2.5 bg-bg-secondary border border-bg-border rounded-lg hover:bg-bg-tertiary transition-all">
          <Bell size={18} className="text-text-secondary" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent-red rounded-full" />
        </button>
      </div>

      {/* ── MARKET INDICES ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <IndexCard name="Nifty 50" value={nifty50.value} change={nifty50.change} />
        <IndexCard name="SENSEX" value={sensex.value} change={sensex.change} />
        <IndexCard name="Gold (10g)" value={gold.value} change={gold.change} />
        <IndexCard name="USD/INR" value={dollarInr.value} change={dollarInr.change} />
      </div>

      {/* ── PORTFOLIO STATS ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Portfolio Value"
          value={portfolioValue}
          change={portfolioChange}
          icon={BriefcaseBusiness}
          iconColor="text-accent-cyan"
          prefix="₹"
          className="col-span-1"
        />
        <StatCard
          label="Total P&L"
          value={totalPL}
          change={totalPLPercent}
          icon={TrendingUp}
          iconColor="text-accent-green"
          prefix="+₹"
        />
        <StatCard
          label="Watchlist Items"
          value={watchlistItems.length}
          icon={Star}
          iconColor="text-accent-yellow"
        />
        <StatCard
          label="Active Alerts"
          value={2}
          icon={Bell}
          iconColor="text-accent-purple"
        />
      </div>

      {/* ── MAIN CONTENT GRID ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Portfolio Chart — takes 2/3 of the row */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <SectionHeader
              title="Portfolio Performance"
              subtitle="Last 6 months"
              action={
                <button
                  onClick={() => navigate('/portfolio')}
                  className="flex items-center gap-1 text-xs text-accent-cyan hover:underline"
                >
                  View details <ArrowRight size={12} />
                </button>
              }
            />
            <PortfolioLineChart data={portfolioHistory} />
          </Card>

          {/* Gainers & Losers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Card>
              <SectionHeader
                title="Top Gainers"
                subtitle="Today"
                action={<Badge variant="green">NSE/BSE</Badge>}
              />
              <div className="space-y-0.5">
                {topGainers.map((s) => (
                  <StockRow
                    key={s.symbol}
                    {...s}
                    extra={s.volume}
                    onClick={() => navigate(`/company/${s.symbol}`)}
                  />
                ))}
              </div>
            </Card>

            <Card>
              <SectionHeader
                title="Top Losers"
                subtitle="Today"
                action={<Badge variant="red">NSE/BSE</Badge>}
              />
              <div className="space-y-0.5">
                {topLosers.map((s) => (
                  <StockRow
                    key={s.symbol}
                    {...s}
                    extra={s.volume}
                    onClick={() => navigate(`/company/${s.symbol}`)}
                  />
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Right sidebar — Watchlist + News */}
        <div className="space-y-5">
          {/* Sector Allocation */}
          <Card>
            <SectionHeader title="Sector Allocation" />
            <PortfolioPieChart data={portfolioAllocation} />
          </Card>

          {/* Watchlist */}
          <Card>
            <SectionHeader
              title="Watchlist"
              action={
                <button
                  onClick={() => navigate('/watchlist')}
                  className="text-xs text-accent-cyan hover:underline"
                >
                  View all
                </button>
              }
            />
            <div className="space-y-0.5">
              {watchlistItems.slice(0, 4).map((s) => (
                <StockRow
                  key={s.symbol}
                  {...s}
                  onClick={() => navigate(`/company/${s.symbol}`)}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ── LATEST NEWS ───────────────────────────────────────────────── */}
      <Card>
        <SectionHeader
          title="Latest Financial News"
          subtitle="AI-curated • Sentiment analyzed"
          action={
            <button
              onClick={() => navigate('/news')}
              className="flex items-center gap-1 text-xs text-accent-cyan hover:underline"
            >
              View all news <ArrowRight size={12} />
            </button>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          {newsItems.slice(0, 4).map((item) => (
            <MiniNewsCard key={item.id} item={item} />
          ))}
        </div>
      </Card>

      {/* ── AI QUICK ACTIONS ──────────────────────────────────────────── */}
      <Card className="bg-gradient-to-r from-accent-cyan/5 to-accent-purple/5 border-accent-cyan/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-semibold text-text-primary text-lg">
              Ask the AI anything
            </h3>
            <p className="text-text-secondary text-sm mt-1">
              &quot;Should I invest in TCS?&quot; · &quot;What is EBITDA?&quot; · &quot;Compare Infosys and Wipro&quot;
            </p>
          </div>
          <button
            onClick={() => navigate('/chat')}
            className="btn-primary shrink-0 flex items-center gap-2"
          >
            <BarChart3 size={16} />
            Open AI Chat
          </button>
        </div>
      </Card>
    </div>
  );
}
