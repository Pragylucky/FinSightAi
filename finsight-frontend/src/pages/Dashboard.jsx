// Dashboard.jsx — first screen after login.
// Everything here comes from the API: portfolio, watchlist, news, indices and top movers.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BriefcaseBusiness, Star, ArrowRight, Sparkles, Layers, Search, Scale, SlidersHorizontal, MessageSquareText } from 'lucide-react';
import { Card, StatCard, SectionHeader, StockRow, EmptyState, ErrorNotice, LoadingSkeleton } from '../components/ui';
import { PortfolioPieChart } from '../components/charts';
import { Stagger, Item, CountUp } from '../components/motion';
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
  const strength = Math.min(100, Math.abs(change) * 25); // 4% move fills the bar
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className={`relative overflow-hidden border rounded-lg p-3 ${isUp ? 'bg-accent-green/[0.04] border-accent-green/20' : 'bg-accent-red/[0.04] border-accent-red/20'}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-text-muted mb-0.5">{name}</p>
          <p className="font-mono font-bold text-sm text-text-primary"><CountUp value={value} decimals={2} /></p>
        </div>
        <div className={`flex items-center gap-1 text-xs font-mono font-semibold ${isUp ? 'text-accent-green' : 'text-accent-red'}`}>
          <motion.span animate={{ y: isUp ? [0, -2, 0] : [0, 2, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }} className="flex">
            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          </motion.span>
          {isUp ? '+' : ''}{change.toFixed(2)}%
        </div>
      </div>
      <div className="mt-2.5 h-0.5 rounded-full bg-bg-border overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${isUp ? 'bg-accent-green' : 'bg-accent-red'}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(strength, 6)}%` }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </motion.div>
  );
}

const QUICK = [
  { label: 'Research a stock', to: '/company', icon: Search },
  { label: 'Compare', to: '/compare', icon: Scale },
  { label: 'Screener', to: '/screener', icon: SlidersHorizontal },
  { label: 'Ask the AI', to: '/chat', icon: MessageSquareText },
];

const PROMPTS = ['Should I invest in TCS?', 'What is EBITDA?', 'Compare Infosys and Wipro', 'Is Bajaj Finance overvalued?'];

// Cycles example questions with a slide-up swap
function RotatingPrompt() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % PROMPTS.length), 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="relative inline-block h-6 overflow-hidden align-bottom min-w-[16rem]" aria-live="off">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={i}
          initial={{ y: 22, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -22, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-0 text-accent-primary"
        >
          &ldquo;{PROMPTS[i]}&rdquo;
        </motion.span>
      </AnimatePresence>
    </span>
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
      <Item className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-text-primary">
            {greeting()}, <span className="gradient-text">{firstName}</span>
          </h1>
          <p className="text-text-secondary text-sm mt-1.5">Here&apos;s where your money and the market stand today.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK.map(({ label, to, icon: Icon }, i) => (
            <motion.button
              key={to}
              onClick={() => navigate(to)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.07 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="group flex items-center gap-2 h-9 px-3.5 rounded-full border border-bg-border bg-bg-secondary/80 text-sm text-text-secondary hover:text-text-primary hover:border-accent-primary/50 hover:shadow-[0_0_20px_rgb(var(--c-primary)/0.18)] transition-all"
            >
              <Icon size={14} className="text-accent-primary group-hover:scale-110 transition-transform" />
              {label}
            </motion.button>
          ))}
        </div>
      </Item>

      <Item className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
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
              subtitle="Across ~265 NSE stocks, today"
              action={<button onClick={() => navigate('/screener')} className="flex items-center gap-1 text-xs text-accent-primary hover:underline">Screener <ArrowRight size={12} /></button>}
            />
            {market.loading ? <LoadingSkeleton lines={5} height="h-8" /> : market.error ? (
              <ErrorNotice message={`Couldn't load market data: ${market.error}`} onRetry={market.reload} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[['Gainers', gainers], ['Losers', losers]].map(([label, list]) => (
                  <div key={label}>
                    <p className="text-xs uppercase tracking-wider text-text-muted mb-1 px-3">{label}</p>
                    <Stagger className="space-y-0.5" stagger={0.05}>
                      {list.map((s) => (
                        <Item key={s.symbol} whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 400, damping: 26 }}>
                          <StockRow {...s} onClick={() => navigate(`/company/${encodeURIComponent(s.symbol)}`)} />
                        </Item>
                      ))}
                    </Stagger>
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
        <div className="border-flow rounded-xl">
          <div className="rounded-[11px] bg-bg-secondary p-5 bg-gradient-to-r from-accent-primary/5 to-accent-secondary/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-semibold text-text-primary text-xl">Ask the AI anything</h3>
                <p className="text-text-secondary text-sm mt-1.5 flex flex-wrap items-center gap-x-1.5">Try <RotatingPrompt /></p>
              </div>
              <motion.button onClick={() => navigate('/chat')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-primary shrink-0 flex items-center gap-2">
                <Sparkles size={16} />
                Open AI chat
                <ArrowRight size={15} />
              </motion.button>
            </div>
          </div>
        </div>
      </Item>
    </Stagger>
  );
}

