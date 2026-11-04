// Dashboard.jsx — first screen after login.
// Everything here comes from the API: portfolio, watchlist, news, indices and top movers.

import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, BriefcaseBusiness, Star, ArrowRight, Sparkles, Layers } from 'lucide-react';
import { Card, StatCard, SectionHeader, StockRow, EmptyState, ErrorNotice, LoadingSkeleton } from '../components/ui';
import { PortfolioPieChart } from '../components/charts';
import { Stagger, Item } from '../components/motion';
import { useAuth } from '../context/AuthContext';
import { greeting, timeAgo } from '../lib/format';
import useApi from '../lib/useApi';
import api from '../services/api';
import { CHART_PALETTE } from '../lib/theme';

const fetchPortfolio = () => api.portfolio.get();
const fetchWatchlist = () => api.watchlist.get();
const fetchNews = () => api.news.get();
const fetchMarket = () => api.market.overview();


function IndexCard({ name, value, change }) {
  const isUp = change >= 0;
  return (
    <div className="bg-bg-tertiary/80 border border-bg-border rounded-lg p-3 flex items-center justify-between">
      <div>
        <p className="text-xs text-text-muted mb-0.5">{name}</p>
        <p className="font-mono font-bold text-sm text-text-primary">{value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
      </div>
      <div className={`flex items-center gap-1 text-xs font-mono font-semibold ${isUp ? 'text-accent-green' : 'text-accent-red'}`}>
        {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {isUp ? '+' : ''}{change.toFixed(2)}%
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const portfolio = useApi(fetchPortfolio, { allow404: true });
  const watchlist = useApi(fetchWatchlist, { allow404: true });
  const news = useApi(fetchNews);
  const market = useApi(fetchMarket);

  const summary = portfolio.data?.portfolio?.summary;
  const holdings = portfolio.data?.portfolio?.holdings || [];
  const stocks = watchlist.data?.watchlist?.stocks || [];
  const headlines = (news.data?.news || []).slice(0, 4);
  const indices = market.data?.indices || [];
  const gainers = market.data?.gainers || [];
  const losers = market.data?.losers || [];

  // Sector allocation from real holdings by current value
  const bySector = {};
  holdings.forEach((h) => {
    const key = h.sector || 'Other';
    bySector[key] = (bySector[key] || 0) + (h.currentValue ?? h.quantity * h.averagePrice);
  });
  const total = Object.values(bySector).reduce((a, b) => a + b, 0);
  const allocation = Object.entries(bySector)
    .map(([name, v], i) => ({ name, value: Math.round((v / total) * 100), color: CHART_PALETTE[i % CHART_PALETTE.length] }))
    .sort((a, b) => b.value - a.value);

  const firstName = (user?.name || 'there').split(' ')[0];

  return (
    <Stagger className="space-y-6" stagger={0.07}>
      <Item>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-text-primary">
          {greeting()}, <span className="gradient-text">{firstName}</span>
        </h1>
        <p className="text-text-secondary text-sm mt-1">Here&apos;s where your money and the market stand today.</p>
      </Item>

      <Item className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {market.loading
          ? [0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-[62px] rounded-lg" />)
          : indices.map((i) => <IndexCard key={i.name} name={i.name} value={i.value} change={i.change} />)}
      </Item>

      <Item className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Portfolio value" value={Math.round(summary?.totalCurrent || 0)} prefix="₹" icon={BriefcaseBusiness} iconColor="text-accent-primary" />
        <StatCard
          label="Total P&L"
          value={Math.round(summary?.totalPL || 0)}
          change={summary ? summary.totalPLPercent : undefined}
          prefix={summary?.totalPL < 0 ? '−₹' : '+₹'}
          icon={TrendingUp}
          iconColor={summary?.totalPL < 0 ? 'text-accent-red' : 'text-accent-green'}
        />
        <StatCard label="Holdings" value={holdings.length} icon={Layers} iconColor="text-accent-secondary" />
        <StatCard label="Watchlist" value={stocks.length} icon={Star} iconColor="text-accent-warn" />
      </Item>

      {portfolio.error && <ErrorNotice message={`Couldn't load your portfolio: ${portfolio.error}`} onRetry={portfolio.reload} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Item className="lg:col-span-2 space-y-5">
          <Card>
            <SectionHeader
              title="Top movers"
              subtitle="Across ~100 large NSE stocks, today"
              action={<button onClick={() => navigate('/screener')} className="flex items-center gap-1 text-xs text-accent-primary hover:underline">Screener <ArrowRight size={12} /></button>}
            />
            {market.loading ? <LoadingSkeleton lines={5} height="h-8" /> : market.error ? (
              <ErrorNotice message={`Couldn't load market data: ${market.error}`} onRetry={market.reload} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[['Gainers', gainers], ['Losers', losers]].map(([label, list]) => (
                  <div key={label}>
                    <p className="text-xs uppercase tracking-wider text-text-muted mb-1 px-3">{label}</p>
                    <div className="space-y-0.5">
                      {list.map((s) => (
                        <StockRow key={s.symbol} {...s} onClick={() => navigate(`/company/${encodeURIComponent(s.symbol)}`)} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <SectionHeader
              title="Latest news"
              action={
                <button onClick={() => navigate('/news')} className="flex items-center gap-1 text-xs text-accent-primary hover:underline">
                  All news <ArrowRight size={12} />
                </button>
              }
            />
            {news.loading ? <LoadingSkeleton lines={4} height="h-5" /> : news.error ? (
              <ErrorNotice message={news.error} onRetry={news.reload} />
            ) : headlines.length === 0 ? (
              <p className="text-sm text-text-muted py-4">No headlines right now.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                {headlines.map((item, i) => (
                  <a
                    key={item.id || item.url || i}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block py-3 border-b border-bg-border last:border-0 group"
                  >
                    <p className="text-sm font-medium text-text-primary leading-snug mb-1 group-hover:text-accent-primary transition-colors line-clamp-2">{item.title}</p>
                    <p className="text-xs text-text-muted">{item.source}{item.time ? ` · ${timeAgo(item.time)}` : ''}</p>
                  </a>
                ))}
              </div>
            )}
          </Card>
        </Item>

        <Item className="space-y-5">
          <Card>
            <SectionHeader title="Sector allocation" />
            {portfolio.loading ? <LoadingSkeleton lines={4} height="h-6" /> : allocation.length ? (
              <PortfolioPieChart data={allocation} />
            ) : (
              <EmptyState icon={BriefcaseBusiness} title="No holdings yet" description="Add a holding to see how your money is split." action={<button onClick={() => navigate('/portfolio')} className="btn-secondary text-sm py-2">Add holding</button>} />
            )}
          </Card>

          <Card>
            <SectionHeader
              title="Watchlist"
              action={<button onClick={() => navigate('/watchlist')} className="text-xs text-accent-primary hover:underline">View all</button>}
            />
            {watchlist.loading ? <LoadingSkeleton lines={4} height="h-8" /> : stocks.length ? (
              <div className="space-y-0.5">
                {stocks.slice(0, 5).map((s) => (
                  <StockRow key={s.symbol} symbol={s.symbol} name={s.name} price={s.currentPrice} change={s.change} onClick={() => navigate(`/company/${encodeURIComponent(s.symbol)}`)} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted py-4">Nothing on your watchlist yet.</p>
            )}
          </Card>
        </Item>
      </div>

      <Item>
        <Card className="bg-gradient-to-r from-accent-primary/5 to-accent-secondary/10 border-accent-primary/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-semibold text-text-primary text-lg">Ask the AI anything</h3>
              <p className="text-text-secondary text-sm mt-1">&quot;Should I invest in TCS?&quot; · &quot;What is EBITDA?&quot; · &quot;Compare Infosys and Wipro&quot;</p>
            </div>
            <button onClick={() => navigate('/chat')} className="btn-primary shrink-0 flex items-center gap-2">
              <Sparkles size={16} />
              Open AI chat
            </button>
          </div>
        </Card>
      </Item>
    </Stagger>
  );
}

