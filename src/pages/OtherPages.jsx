// Portfolio.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Plus, BriefcaseBusiness } from 'lucide-react';
import { Card, SectionHeader, Badge, ChangeBadge } from '../components/ui';
import { PortfolioPieChart, PortfolioLineChart } from '../components/charts';
import { portfolioHoldings, portfolioAllocation, generatePortfolioHistory, dashboardStats } from '../data/mockData';

function HoldingRow({ holding, onClick }) {
  const { symbol, name, qty, avgPrice, currentPrice, sector } = holding;
  const invested = qty * avgPrice;
  const current = qty * currentPrice;
  const pl = current - invested;
  const plPct = ((current - invested) / invested) * 100;
  const isPos = pl >= 0;

  return (
    <tr
      onClick={onClick}
      className="border-b border-bg-border last:border-0 hover:bg-bg-tertiary/50 cursor-pointer transition-all group"
    >
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-bg-tertiary border border-bg-border flex items-center justify-center text-xs font-bold font-mono text-accent-cyan">
            {symbol[0]}
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary group-hover:text-accent-cyan transition-colors">{symbol}</p>
            <p className="text-xs text-text-muted">{name}</p>
          </div>
        </div>
      </td>
      <td className="py-3 pr-4"><Badge variant="default" className="text-xs">{sector}</Badge></td>
      <td className="py-3 pr-4 font-mono text-sm text-text-secondary">{qty}</td>
      <td className="py-3 pr-4 font-mono text-sm text-text-secondary">₹{avgPrice.toLocaleString()}</td>
      <td className="py-3 pr-4 font-mono text-sm text-text-primary font-semibold">₹{currentPrice.toLocaleString()}</td>
      <td className="py-3 pr-4 font-mono text-sm text-text-primary">₹{current.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
      <td className="py-3">
        <p className={`font-mono text-sm font-semibold ${isPos ? 'text-accent-green' : 'text-accent-red'}`}>
          {isPos ? '+' : ''}₹{pl.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </p>
        <p className={`font-mono text-xs ${isPos ? 'text-accent-green' : 'text-accent-red'}`}>
          {isPos ? '+' : ''}{plPct.toFixed(2)}%
        </p>
      </td>
    </tr>
  );
}

export function Portfolio() {
  const navigate = useNavigate();
  const portfolioHistory = generatePortfolioHistory();
  const totalInvested = portfolioHoldings.reduce((acc, h) => acc + h.qty * h.avgPrice, 0);
  const totalCurrent = portfolioHoldings.reduce((acc, h) => acc + h.qty * h.currentPrice, 0);
  const totalPL = totalCurrent - totalInvested;
  const totalPLPct = (totalPL / totalInvested) * 100;
  const isPos = totalPL >= 0;

  return (
    <div className="space-y-5 page-enter">
      <SectionHeader
        title="My Portfolio"
        subtitle="Track your holdings and returns"
        action={
          <button className="btn-primary flex items-center gap-2 text-sm py-2">
            <Plus size={15} /> Add Holdings
          </button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { l: 'Portfolio Value', v: `₹${totalCurrent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` },
          { l: 'Total Invested', v: `₹${totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` },
          { l: 'Total P&L', v: `${isPos ? '+' : ''}₹${totalPL.toLocaleString('en-IN', { maximumFractionDigits: 0 })} (${isPos ? '+' : ''}${totalPLPct.toFixed(2)}%)`, color: isPos ? 'text-accent-green' : 'text-accent-red' },
        ].map(({ l, v, color }) => (
          <Card key={l}>
            <p className="text-text-muted text-sm mb-1">{l}</p>
            <p className={`font-mono font-bold text-xl ${color || 'text-text-primary'}`}>{v}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Performance Chart */}
        <Card className="lg:col-span-2">
          <SectionHeader title="Portfolio Performance" subtitle="6 months history" />
          <PortfolioLineChart data={portfolioHistory} />
        </Card>

        {/* Allocation */}
        <Card>
          <SectionHeader title="Sector Allocation" />
          <PortfolioPieChart data={portfolioAllocation} />
        </Card>
      </div>

      {/* Holdings Table */}
      <Card>
        <SectionHeader title="Holdings" subtitle={`${portfolioHoldings.length} stocks`} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-border text-left">
                {['Stock', 'Sector', 'Qty', 'Avg Price', 'Current', 'Value', 'P&L'].map(h => (
                  <th key={h} className="pb-3 pr-4 text-xs text-text-muted font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {portfolioHoldings.map((h) => (
                <HoldingRow
                  key={h.symbol}
                  holding={h}
                  onClick={() => navigate(`/company/${h.symbol}`)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── WATCHLIST ────────────────────────────────────────────────────────────────
import { Star, StarOff, Bell, Trash2 } from 'lucide-react';
import { watchlistItems } from '../data/mockData';

export function Watchlist() {
  const navigate = useNavigate();
  const [items, setItems] = useState(watchlistItems);

  const remove = (symbol) => setItems(prev => prev.filter(i => i.symbol !== symbol));

  return (
    <div className="space-y-5 page-enter">
      <SectionHeader
        title="Watchlist"
        subtitle={`${items.length} stocks tracked`}
        action={
          <button className="btn-secondary text-sm py-2 flex items-center gap-2">
            <Plus size={15} /> Add Stock
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => {
          const isPos = item.change >= 0;
          const hitTarget = item.price >= item.targetPrice * 0.95;
          return (
            <Card key={item.symbol} hover className="group">
              <div className="flex items-start justify-between mb-3">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => navigate(`/company/${item.symbol}`)}
                >
                  <div className="w-10 h-10 rounded-lg bg-bg-tertiary border border-bg-border flex items-center justify-center text-sm font-bold font-mono text-accent-cyan">
                    {item.symbol[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary group-hover:text-accent-cyan transition-colors">{item.symbol}</p>
                    <p className="text-xs text-text-muted">{item.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 text-text-muted hover:text-accent-yellow transition-colors">
                    <Bell size={14} />
                  </button>
                  <button onClick={() => remove(item.symbol)} className="p-1.5 text-text-muted hover:text-accent-red transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="font-mono font-bold text-xl text-text-primary">₹{item.price.toLocaleString()}</p>
                  <p className={`text-sm font-mono font-semibold ${isPos ? 'text-accent-green' : 'text-accent-red'}`}>
                    {isPos ? '+' : ''}{item.change.toFixed(2)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-muted">Target</p>
                  <p className="font-mono font-semibold text-accent-cyan text-sm">₹{item.targetPrice}</p>
                  <p className="text-xs text-text-muted">
                    {((item.targetPrice / item.price - 1) * 100).toFixed(1)}% upside
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-bg-border flex items-center justify-between text-xs text-text-muted">
                <span>PE: <span className="text-text-secondary font-mono">{item.pe}</span></span>
                <span>Sector: <Badge variant="default">{item.sector}</Badge></span>
                <span>MCap: <span className="text-text-secondary">{item.marketCap}</span></span>
              </div>

              {hitTarget && (
                <div className="mt-2 px-2 py-1 bg-accent-green/10 border border-accent-green/20 rounded text-xs text-accent-green">
                  Near target price — consider reviewing position
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── NEWS ─────────────────────────────────────────────────────────────────────
import { newsItems } from '../data/mockData';
import { Newspaper, Filter } from 'lucide-react';

export function News() {
  const [filter, setFilter] = useState('all');
  const categories = ['all', 'Earnings', 'Macro', 'IPO', 'Sector', 'FII/DII'];

  const filtered = filter === 'all' ? newsItems : newsItems.filter(n => n.category === filter);

  return (
    <div className="space-y-5 page-enter">
      <SectionHeader title="Financial News" subtitle="AI-curated & sentiment analyzed" />

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize
              ${filter === c
                ? 'bg-accent-cyan text-bg-primary font-semibold'
                : 'bg-bg-secondary border border-bg-border text-text-secondary hover:text-text-primary'
              }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* News cards */}
      <div className="space-y-4">
        {filtered.map((item) => {
          const sentimentVariant = { bullish: 'green', bearish: 'red', neutral: 'yellow' }[item.sentiment];
          return (
            <Card key={item.id} hover>
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge variant={sentimentVariant} className="capitalize">{item.sentiment}</Badge>
                    <Badge variant="default">{item.category}</Badge>
                    <span className="text-xs text-text-muted">{item.source} · {item.time}</span>
                  </div>
                  <h3 className="font-semibold text-text-primary mb-2 leading-snug hover:text-accent-cyan cursor-pointer transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{item.summary}</p>

                  {item.relatedStocks?.length > 0 && (
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <span className="text-xs text-text-muted">Related:</span>
                      {item.relatedStocks.map(s => (
                        <Badge key={s} variant="cyan" className="cursor-pointer hover:opacity-80">{s}</Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sentiment meter */}
                <div className="shrink-0 w-28 text-center">
                  <p className="text-xs text-text-muted mb-2">Market Sentiment</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-accent-green">Bull</span>
                      <span className="font-mono text-accent-green">{item.bullishScore}%</span>
                    </div>
                    <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                      <div className="h-full bg-accent-green rounded-full" style={{ width: `${item.bullishScore}%` }} />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-accent-red">Bear</span>
                      <span className="font-mono text-accent-red">{item.bearishScore}%</span>
                    </div>
                    <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                      <div className="h-full bg-accent-red rounded-full" style={{ width: `${item.bearishScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── SCREENER ─────────────────────────────────────────────────────────────────
import { screenerStocks } from '../data/mockData';
import { SlidersHorizontal, Search, ArrowUpDown } from 'lucide-react';

export function Screener() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('marketCap');
  const [sortDir, setSortDir] = useState('desc');
  const [filters, setFilters] = useState({ sector: 'all', peMax: 100, roeMin: 0 });

  const sectors = ['all', ...new Set(screenerStocks.map(s => s.sector))];

  const sorted = [...screenerStocks]
    .filter(s => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.symbol.toLowerCase().includes(search.toLowerCase());
      const matchSector = filters.sector === 'all' || s.sector === filters.sector;
      const matchPE = s.pe <= filters.peMax;
      const matchROE = s.roe >= filters.roeMin;
      return matchSearch && matchSector && matchPE && matchROE;
    })
    .sort((a, b) => sortDir === 'desc' ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy]);

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const ThHeader = ({ col, label }) => (
    <th
      className="pb-3 pr-4 text-xs text-text-muted font-medium whitespace-nowrap cursor-pointer hover:text-text-primary transition-colors"
      onClick={() => handleSort(col)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortBy === col && <ArrowUpDown size={10} className="text-accent-cyan" />}
      </div>
    </th>
  );

  return (
    <div className="space-y-5 page-enter">
      <SectionHeader title="Stock Screener" subtitle="Filter stocks by any financial metric" />

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-text-muted mb-1 block">Search</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                className="input-field pl-8 text-sm h-9"
                placeholder="Company or symbol..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-text-muted mb-1 block">Sector</label>
            <select
              className="input-field text-sm h-9 capitalize"
              value={filters.sector}
              onChange={e => setFilters(f => ({ ...f, sector: e.target.value }))}
            >
              {sectors.map(s => <option key={s} value={s} className="bg-bg-secondary capitalize">{s}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-text-muted mb-1 block">Max PE: {filters.peMax}</label>
            <input
              type="range" min={5} max={100} value={filters.peMax}
              onChange={e => setFilters(f => ({ ...f, peMax: +e.target.value }))}
              className="w-full accent-accent-cyan mt-2"
            />
          </div>

          <div>
            <label className="text-xs text-text-muted mb-1 block">Min ROE: {filters.roeMin}%</label>
            <input
              type="range" min={0} max={50} value={filters.roeMin}
              onChange={e => setFilters(f => ({ ...f, roeMin: +e.target.value }))}
              className="w-full accent-accent-cyan mt-2"
            />
          </div>
        </div>
        <p className="text-xs text-text-muted mt-3">{sorted.length} stocks match your filters</p>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-border text-left">
                <th className="pb-3 pr-4 text-xs text-text-muted font-medium">Company</th>
                <ThHeader col="marketCap" label="Mkt Cap (Cr)" />
                <ThHeader col="pe" label="PE" />
                <ThHeader col="roe" label="ROE %" />
                <ThHeader col="debtEq" label="D/E" />
                <ThHeader col="div" label="Div Yield %" />
                <ThHeader col="revenueGrowth" label="Rev Growth %" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((s) => (
                <tr
                  key={s.symbol}
                  onClick={() => navigate(`/company/${s.symbol}`)}
                  className="border-b border-bg-border last:border-0 hover:bg-bg-tertiary/50 cursor-pointer transition-all group"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-bg-tertiary border border-bg-border flex items-center justify-center text-xs font-bold font-mono text-accent-cyan">
                        {s.symbol[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary group-hover:text-accent-cyan transition-colors text-xs">{s.symbol}</p>
                        <p className="text-text-muted text-xs">{s.sector}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs text-text-secondary">{(s.marketCap / 1000).toFixed(0)}K</td>
                  <td className="py-3 pr-4 font-mono text-xs text-text-primary">{s.pe}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-accent-green">{s.roe}%</td>
                  <td className="py-3 pr-4 font-mono text-xs text-text-secondary">{s.debtEq}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-accent-cyan">{s.div}%</td>
                  <td className="py-3 font-mono text-xs">
                    <span className={s.revenueGrowth > 0 ? 'text-accent-green' : 'text-accent-red'}>
                      {s.revenueGrowth > 0 ? '+' : ''}{s.revenueGrowth}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── MUTUAL FUNDS ─────────────────────────────────────────────────────────────
import { mutualFunds } from '../data/mockData';
import { TrendingUp as TUp } from 'lucide-react';

export function Funds() {
  const [sortBy, setSortBy] = useState('returns5Y');
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = ['all', ...new Set(mutualFunds.map(f => f.category))];
  const riskColors = { Low: 'green', Moderate: 'cyan', 'Moderate High': 'yellow', High: 'yellow', 'Very High': 'red' };

  const filtered = [...mutualFunds]
    .filter(f => filterCategory === 'all' || f.category === filterCategory)
    .sort((a, b) => b[sortBy] - a[sortBy]);

  return (
    <div className="space-y-5 page-enter">
      <SectionHeader title="Mutual Funds" subtitle="Compare and analyze top-rated funds" />

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setFilterCategory(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filterCategory === c
                ? 'bg-accent-cyan text-bg-primary font-semibold'
                : 'bg-bg-secondary border border-bg-border text-text-secondary hover:text-text-primary'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Sort options */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-text-muted">Sort by:</span>
        {[['returns5Y', '5Y Returns'], ['returns3Y', '3Y Returns'], ['returns1Y', '1Y Returns'], ['expenseRatio', 'Expense']].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setSortBy(v)}
            className={`px-2 py-1 rounded text-xs font-medium transition-all ${sortBy === v ? 'text-accent-cyan' : 'text-text-muted hover:text-text-secondary'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Fund cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((fund) => (
          <Card key={fund.id} hover>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={riskColors[fund.riskLevel] || 'default'}>{fund.riskLevel}</Badge>
                  <Badge variant="default">{fund.category}</Badge>
                </div>
                <h3 className="font-semibold text-text-primary text-sm leading-snug">{fund.name}</h3>
                <p className="text-xs text-text-muted mt-0.5">{fund.amc} · AUM: {fund.aum}</p>
              </div>
              {/* Star rating */}
              <div className="flex">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} size={12} className={i < fund.rating ? 'text-accent-yellow fill-accent-yellow' : 'text-bg-border'} />
                ))}
              </div>
            </div>

            {/* Returns */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[['1Y', fund.returns1Y], ['3Y', fund.returns3Y], ['5Y', fund.returns5Y]].map(([p, v]) => (
                <div key={p} className="bg-bg-tertiary rounded-lg p-2 text-center">
                  <p className="text-xs text-text-muted">{p} Return</p>
                  <p className="font-mono font-bold text-accent-green text-sm">{v}%</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-bg-border text-xs text-text-muted">
              <span>NAV: <span className="font-mono text-text-secondary">₹{fund.nav}</span></span>
              <span>Expense: <span className="font-mono text-text-secondary">{fund.expenseRatio}%</span></span>
              <span>Min SIP: <span className="font-mono text-accent-cyan">₹{fund.minSip}</span></span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── LEARNING CENTER ──────────────────────────────────────────────────────────
import { financeDictionary } from '../data/mockData';
import { GraduationCap, BookOpen, Calculator, ChevronDown, ChevronUp } from 'lucide-react';

export function Learn() {
  const [openTerm, setOpenTerm] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = financeDictionary.filter(
    d => d.term.toLowerCase().includes(search.toLowerCase()) ||
         d.short.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 page-enter">
      <SectionHeader
        title="Learning Center"
        subtitle="Understand finance from basics to advanced"
      />

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: BookOpen, title: 'Finance Dictionary', desc: 'Plain-English explanations of every financial term', color: 'text-accent-cyan', bg: 'bg-accent-cyan/10 border-accent-cyan/20' },
          { icon: GraduationCap, title: 'Investment Basics', desc: 'From "what is a stock" to advanced portfolio theory', color: 'text-accent-purple', bg: 'bg-accent-purple/10 border-accent-purple/20' },
          { icon: Calculator, title: 'SIP Calculator', desc: 'Calculate how much your investments will grow over time', color: 'text-accent-green', bg: 'bg-accent-green/10 border-accent-green/20' },
        ].map(({ icon: Icon, title, desc, color, bg }) => (
          <Card key={title} hover className="text-center">
            <div className={`w-12 h-12 rounded-xl border mx-auto flex items-center justify-center mb-3 ${bg}`}>
              <Icon size={22} className={color} />
            </div>
            <h3 className="font-semibold text-text-primary mb-1">{title}</h3>
            <p className="text-text-secondary text-sm">{desc}</p>
          </Card>
        ))}
      </div>

      {/* SIP Calculator (simple interactive one) */}
      <SIPCalculator />

      {/* Finance Dictionary */}
      <div>
        <SectionHeader title="Finance Dictionary" subtitle="Every term explained simply" />
        
        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            className="input-field pl-9 text-sm"
            placeholder="Search: PE ratio, EBITDA, ROE..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          {filtered.map((item) => (
            <Card key={item.term} className="cursor-pointer" onClick={() => setOpenTerm(openTerm === item.term ? null : item.term)}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-display font-semibold text-text-primary">{item.term}</span>
                  <span className="text-text-muted text-sm ml-2">— {item.short}</span>
                </div>
                {openTerm === item.term ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
              </div>

              {openTerm === item.term && (
                <div className="mt-4 space-y-3 border-t border-bg-border pt-3">
                  <p className="text-text-secondary text-sm leading-relaxed">{item.definition}</p>
                  <div className="bg-bg-tertiary border border-bg-border rounded-lg p-3">
                    <p className="text-xs text-text-muted mb-1 font-medium uppercase tracking-wide">Example</p>
                    <p className="text-sm text-text-primary leading-relaxed">{item.example}</p>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// Simple SIP Calculator component
function SIPCalculator() {
  const [monthly, setMonthly] = useState(5000);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(12);

  // SIP formula: M × [(1 + r)^n - 1] / r × (1 + r)
  // r = monthly rate, n = total months
  const r = rate / 12 / 100;
  const n = years * 12;
  const futureValue = monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const invested = monthly * n;
  const gains = futureValue - invested;

  return (
    <Card className="border-accent-cyan/20">
      <SectionHeader title="SIP Calculator" subtitle="See how your money grows" />
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: `Monthly SIP: ₹${monthly.toLocaleString()}`, value: monthly, min: 500, max: 100000, step: 500, setter: setMonthly },
          { label: `Duration: ${years} years`, value: years, min: 1, max: 30, step: 1, setter: setYears },
          { label: `Expected Return: ${rate}% p.a.`, value: rate, min: 5, max: 30, step: 1, setter: setRate },
        ].map(({ label, value, min, max, step, setter }) => (
          <div key={label}>
            <p className="text-sm text-text-secondary mb-2">{label}</p>
            <input
              type="range" min={min} max={max} step={step} value={value}
              onChange={e => setter(+e.target.value)}
              className="w-full accent-accent-cyan"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-bg-tertiary rounded-lg p-3 text-center">
          <p className="text-xs text-text-muted mb-1">Total Invested</p>
          <p className="font-mono font-bold text-text-primary">₹{invested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-bg-tertiary rounded-lg p-3 text-center">
          <p className="text-xs text-text-muted mb-1">Gains</p>
          <p className="font-mono font-bold text-accent-green">₹{gains.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-accent-cyan/10 border border-accent-cyan/20 rounded-lg p-3 text-center">
          <p className="text-xs text-text-muted mb-1">Final Value</p>
          <p className="font-mono font-bold text-accent-cyan">₹{futureValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        </div>
      </div>
    </Card>
  );
}
