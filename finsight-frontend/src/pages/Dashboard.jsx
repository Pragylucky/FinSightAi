// Dashboard.jsx — first screen after login. A bento layout: a hero chart of the real index data,
// portfolio summary, movers with magnitude bars, headlines and the AI prompt.
// Everything comes from the API: indices, charts, movers, news, portfolio and watchlist.

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  TrendingUp, TrendingDown, BriefcaseBusiness, Star, ArrowRight, ArrowUpRight, Sparkles, Layers,
  Search, Scale, SlidersHorizontal, MessageSquareText, Plus,
} from 'lucide-react';
import { ErrorNotice, LoadingSkeleton } from '../components/ui';
import { PortfolioPieChart } from '../components/charts';
import { Stagger, Item, CountUp } from '../components/motion';
import { useAuth } from '../context/AuthContext';
import { greeting, timeAgo } from '../lib/format';
import { CHART_PALETTE, COLORS } from '../lib/theme';
import { EASE, trackSpotlight } from '../lib/motion';
import useApi from '../lib/useApi';
import api from '../services/api';

const fetchPortfolio = () => api.portfolio.get();
const fetchWatchlist = () => api.watchlist.get();
const fetchNews = () => api.news.get();
const fetchMarket = () => api.market.overview();

const INDEX_SYMBOL = { 'Nifty 50': '^NSEI', Sensex: '^BSESN', 'Bank Nifty': '^NSEBANK', 'USD/INR': 'INR=X' };
const RANGES = [['1W', 7], ['1M', 30], ['3M', 90]];

const QUICK = [
  { label: 'Research', to: '/company', icon: Search },
  { label: 'Compare', to: '/compare', icon: Scale },
  { label: 'Screener', to: '/screener', icon: SlidersHorizontal },
  { label: 'Ask AI', to: '/chat', icon: MessageSquareText },
];
const PROMPTS = ['Should I invest in TCS?', 'What is EBITDA?', 'Compare Infosys and Wipro', 'Is Bajaj Finance overvalued?'];

// A card that glows under the cursor
function Panel({ children, className = '' }) {
  return (
    <div onMouseMove={trackSpotlight} className={`spotlight relative rounded-2xl border border-bg-border bg-bg-secondary/80 backdrop-blur ${className}`}>
      {children}
    </div>
  );
}

function ChartTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="custom-tooltip">
      <p className="text-xs text-text-muted">{p.date}</p>
      <p className="font-mono font-semibold text-sm text-text-primary">{p.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
    </div>
  );
}

// ── Hero: greeting + switchable index chart ──────────────────────────────────────────────────
function Hero({ firstName, indices, loading }) {
  const [selected, setSelected] = useState('Nifty 50');
  const [days, setDays] = useState(30);
  const [charts, setCharts] = useState({});          // `${symbol}:${days}` -> points | 'error'

  const active = indices.find((i) => i.name === selected) || indices[0];
  const symbol = active ? INDEX_SYMBOL[active.name] : null;
  const key = symbol ? `${symbol}:${days}` : null;
  const points = key ? charts[key] : null;

  useEffect(() => {
    if (!key || charts[key]) return undefined;
    let cancelled = false;
    api.company.getChart(symbol, days)
      .then((res) => !cancelled && setCharts((c) => ({ ...c, [key]: (res.data || []).filter((p) => Number.isFinite(p.price)) })))
      .catch(() => !cancelled && setCharts((c) => ({ ...c, [key]: 'error' })));
    return () => { cancelled = true; };
    // `charts` is read only to skip refetching a cached range
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const up = (active?.change ?? 0) >= 0;
  const tone = up ? COLORS.bull : COLORS.bear;
  const series = Array.isArray(points) ? points : [];
  const lo = series.length ? Math.min(...series.map((p) => p.price)) : 0;
  const hi = series.length ? Math.max(...series.map((p) => p.price)) : 0;

  return (
    <Panel className="p-5 sm:p-7 overflow-hidden h-full">
      <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-40" style={{ background: `${tone}33` }} aria-hidden="true" />

      <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-5">
        <div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-text-primary leading-tight">
            {greeting()}, <span className="gradient-text">{firstName}</span>
          </h1>
          <p className="text-text-secondary text-sm mt-1.5">Here&apos;s where the market stands today.</p>
        </div>
        <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl sm:rounded-full border border-bg-border bg-bg-primary/60 self-start" role="tablist" aria-label="Index">
          {indices.map((i) => (
            <button key={i.name} role="tab" aria-selected={i.name === active?.name} onClick={() => setSelected(i.name)}
              className={`relative px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${i.name === active?.name ? 'text-white' : 'text-text-secondary hover:text-text-primary'}`}>
              {i.name === active?.name && <motion.span layoutId="hero-index" className="absolute inset-0 rounded-full bg-accent-primary" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />}
              <span className="relative">{i.name}</span>
            </button>
          ))}
        </div>
      </div>

      {loading || !active ? (
        <div className="relative mt-8 skeleton h-64 rounded-xl" />
      ) : (
        <div className="relative mt-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-text-muted mb-1">{active.name}</p>
              <div className="flex items-baseline gap-3">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p key={active.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                    className="font-mono font-bold text-4xl sm:text-5xl text-text-primary tracking-tight">
                    <CountUp key={active.name} value={active.value} decimals={2} />
                  </motion.p>
                </AnimatePresence>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-mono font-semibold ${up ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'}`}>
                  {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {up ? '+' : ''}{active.change.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="flex gap-1 text-xs">
              {RANGES.map(([label, d]) => (
                <button key={label} onClick={() => setDays(d)} className={`px-2.5 py-1 rounded-md font-medium transition-colors ${days === d ? 'bg-bg-tertiary text-text-primary' : 'text-text-muted hover:text-text-primary'}`}>{label}</button>
              ))}
            </div>
          </div>

          <div className="mt-4 h-60 -mx-2">
            {points === 'error' ? (
              <div className="h-full flex items-center justify-center text-sm text-text-muted">Chart unavailable right now.</div>
            ) : !series.length ? (
              <div className="skeleton h-full rounded-xl mx-2" />
            ) : (
              <ResponsiveContainer width="100%" height="100%" minHeight={240} initialDimension={{ width: 640, height: 240 }}>
                <AreaChart data={series} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="hero-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={tone} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={tone} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <YAxis domain={[lo - (hi - lo) * 0.15, hi + (hi - lo) * 0.1]} hide />
                  <Tooltip content={<ChartTip />} cursor={{ stroke: tone, strokeOpacity: 0.4, strokeDasharray: '4 4' }} />
                  <Area key={key} type="monotone" dataKey="price" stroke={tone} strokeWidth={2.5} fill="url(#hero-fill)" isAnimationActive animationDuration={1100} animationEasing="ease-out" dot={false} activeDot={{ r: 5, strokeWidth: 0, fill: tone }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          {series.length > 0 && (
            <div className="flex justify-between text-xs text-text-muted font-mono mt-1">
              <span>{series[0].date}</span>
              <span>Range {lo.toLocaleString('en-IN', { maximumFractionDigits: 0 })} – {hi.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              <span>{series[series.length - 1].date}</span>
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}

// ── Portfolio summary ────────────────────────────────────────────────────────────────────────
function PortfolioPanel({ portfolio, watchlistCount, navigate }) {
  const summary = portfolio.data?.portfolio?.summary;
  const holdings = portfolio.data?.portfolio?.holdings;

  const allocation = useMemo(() => {
    const bySector = {};
    (holdings || []).forEach((h) => { bySector[h.sector || 'Other'] = (bySector[h.sector || 'Other'] || 0) + (h.valueInr ?? h.currentValue ?? h.quantity * h.averagePrice); });
    const total = Object.values(bySector).reduce((a, b) => a + b, 0);
    return Object.entries(bySector)
      .map(([name, v], i) => ({ name, value: Math.round((v / total) * 100), color: CHART_PALETTE[i % CHART_PALETTE.length] }))
      .sort((a, b) => b.value - a.value);
  }, [holdings]);

  const count = holdings?.length || 0;
  const has = count > 0;
  const pl = summary?.totalPL || 0;

  return (
    <Panel className="p-5 sm:p-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-text-muted flex items-center gap-2"><BriefcaseBusiness size={13} className="text-accent-primary" /> Your portfolio</p>
        <button onClick={() => navigate('/portfolio')} className="text-xs text-accent-primary hover:underline flex items-center gap-1">Open <ArrowUpRight size={12} /></button>
      </div>

      {portfolio.loading ? (
        <div className="mt-5"><LoadingSkeleton lines={3} height="h-8" /></div>
      ) : has ? (
        <>
          <p className="mt-4 font-mono font-bold text-3xl sm:text-4xl text-text-primary"><CountUp value={Math.round(summary?.totalCurrent || 0)} prefix="₹" /></p>
          <p className={`mt-1 text-sm font-mono font-semibold flex items-center gap-1 ${pl >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
            {pl >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {pl >= 0 ? '+' : '−'}₹{Math.abs(Math.round(pl)).toLocaleString('en-IN')} ({pl >= 0 ? '+' : ''}{(summary?.totalPLPercent ?? 0).toFixed(2)}%)
          </p>
          <div className="mt-3 flex-1 min-h-[150px]"><PortfolioPieChart data={allocation} /></div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }} className="w-14 h-14 rounded-2xl bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center mb-4 shadow-[0_0_30px_rgb(var(--c-primary)/0.25)]">
            <BriefcaseBusiness size={24} className="text-accent-primary" />
          </motion.div>
          <p className="font-display font-semibold text-text-primary text-lg">Start your portfolio</p>
          <p className="text-sm text-text-muted mt-1 max-w-[16rem]">Add a holding to see live value, P&amp;L and how your money is split.</p>
          <motion.button onClick={() => navigate('/portfolio')} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="btn-primary mt-5 flex items-center gap-2 text-sm py-2.5"><Plus size={15} /> Add a holding</motion.button>
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        {[
          { label: 'Holdings', value: count, icon: Layers, to: '/portfolio', tone: 'text-accent-secondary' },
          { label: 'Watchlist', value: watchlistCount, icon: Star, to: '/watchlist', tone: 'text-accent-warn' },
        ].map(({ label, value, icon: Icon, to, tone }) => (
          <button key={label} onClick={() => navigate(to)} className="group flex items-center justify-between rounded-xl border border-bg-border bg-bg-primary/50 px-3.5 py-3 hover:border-accent-primary/40 transition-colors text-left">
            <span>
              <span className="block text-[11px] uppercase tracking-wider text-text-muted">{label}</span>
              <span className="block font-mono font-bold text-xl text-text-primary"><CountUp value={value} /></span>
            </span>
            <Icon size={18} className={`${tone} group-hover:scale-110 transition-transform`} />
          </button>
        ))}
      </div>
    </Panel>
  );
}

// ── Movers: tabbed, with a magnitude bar behind each row ─────────────────────────────────────
function MoverRow({ s, max, up, onClick, index }) {
  const width = Math.max(6, (Math.abs(s.change) / max) * 100);
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05, duration: 0.35, ease: EASE }}
      whileHover={{ x: 4 }}
      className="group relative w-full text-left flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 overflow-hidden"
    >
      <motion.span
        className={`absolute inset-y-0 left-0 rounded-xl ${up ? 'bg-accent-green/10' : 'bg-accent-red/10'}`}
        initial={{ width: 0 }} animate={{ width: `${width}%` }} transition={{ delay: 0.1 + index * 0.05, duration: 0.8, ease: EASE }}
        aria-hidden="true"
      />
      <span className="relative flex items-center gap-3 min-w-0">
        <span className="w-9 h-9 rounded-lg bg-bg-primary/70 border border-bg-border flex items-center justify-center text-sm font-bold font-mono text-accent-primary shrink-0 group-hover:border-accent-primary/50 transition-colors">{s.symbol[0]}</span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-text-primary group-hover:text-accent-primary transition-colors">{s.symbol}</span>
          <span className="block text-xs text-text-muted truncate">{s.name}</span>
        </span>
      </span>
      <span className="relative text-right shrink-0">
        <span className="block text-sm font-mono font-semibold text-text-primary">{typeof s.price === 'number' ? s.price.toLocaleString('en-IN') : '—'}</span>
        <span className={`block text-xs font-mono font-bold ${up ? 'text-accent-green' : 'text-accent-red'}`}>{up ? '+' : ''}{s.change.toFixed(2)}%</span>
      </span>
    </motion.button>
  );
}

function Movers({ market, navigate }) {
  const [tab, setTab] = useState('gainers');
  const gainers = market.data?.gainers || [];
  const losers = market.data?.losers || [];
  const list = tab === 'gainers' ? gainers : losers;
  const max = Math.max(1, ...list.map((s) => Math.abs(s.change)));

  return (
    <Panel className="p-5 sm:p-6 h-full">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="font-display font-semibold text-xl text-text-primary">Top movers</h2>
          <p className="text-xs text-text-muted mt-0.5">Across ~265 NSE stocks, today</p>
        </div>
        <div className="flex p-1 rounded-full border border-bg-border bg-bg-primary/60" role="tablist">
          {[['gainers', 'Gainers', TrendingUp], ['losers', 'Losers', TrendingDown]].map(([id, label, Icon]) => (
            <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${tab === id ? 'text-white' : 'text-text-secondary hover:text-text-primary'}`}>
              {tab === id && <motion.span layoutId="movers-tab" className={`absolute inset-0 rounded-full ${id === 'gainers' ? 'bg-accent-green/80' : 'bg-accent-red/80'}`} transition={{ type: 'spring', stiffness: 420, damping: 32 }} />}
              <Icon size={13} className="relative" /><span className="relative">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {market.loading ? <LoadingSkeleton lines={6} height="h-12" /> : market.error ? (
        <ErrorNotice message={`Couldn't load market data: ${market.error}`} onRetry={market.reload} />
      ) : (
        <div className="space-y-1" key={tab}>
          {list.map((s, i) => <MoverRow key={s.symbol} s={s} max={max} up={tab === 'gainers'} index={i} onClick={() => navigate(`/company/${encodeURIComponent(s.symbol)}`)} />)}
        </div>
      )}
      <button onClick={() => navigate('/screener')} className="mt-4 flex items-center gap-1 text-xs text-accent-primary hover:underline">Open the screener <ArrowRight size={12} /></button>
    </Panel>
  );
}

// ── Headlines ────────────────────────────────────────────────────────────────────────────────
function Headlines({ news, navigate }) {
  const headlines = (news.data?.news || []).slice(0, 5);
  return (
    <Panel className="p-5 sm:p-6 h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-semibold text-xl text-text-primary">Latest news</h2>
        <button onClick={() => navigate('/news')} className="flex items-center gap-1 text-xs text-accent-primary hover:underline">All news <ArrowRight size={12} /></button>
      </div>
      {news.loading ? <LoadingSkeleton lines={5} height="h-10" /> : news.error ? (
        <ErrorNotice message={news.error} onRetry={news.reload} />
      ) : headlines.length === 0 ? (
        <p className="text-sm text-text-muted py-4">No headlines right now.</p>
      ) : (
        <Stagger className="divide-y divide-bg-border" stagger={0.06}>
          {headlines.map((item, i) => (
            <Item key={item.id || item.url || i}>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-3 py-3">
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${item.sentiment === 'bullish' ? 'bg-accent-green' : item.sentiment === 'bearish' ? 'bg-accent-red' : 'bg-text-muted'}`} />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-text-primary leading-snug group-hover:text-accent-primary transition-colors line-clamp-2">{item.title}</span>
                  <span className="block text-xs text-text-muted mt-1">{item.source}{item.time ? ` · ${timeAgo(item.time)}` : ''}</span>
                </span>
                <ArrowUpRight size={14} className="mt-1 text-text-muted opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </a>
            </Item>
          ))}
        </Stagger>
      )}
    </Panel>
  );
}

function RotatingPrompt() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % PROMPTS.length), 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="relative inline-block h-6 overflow-hidden align-bottom min-w-[16rem]" aria-live="off">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={i} initial={{ y: 22, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -22, opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} className="absolute left-0 text-accent-primary">
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

  const stocks = watchlist.data?.watchlist?.stocks || [];
  const indices = market.data?.indices || [];
  const firstName = (user?.name || 'there').split(' ')[0];

  return (
    <Stagger className="space-y-5" stagger={0.08}>
      <Item className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8"><Hero firstName={firstName} indices={indices} loading={market.loading} /></div>
        <div className="lg:col-span-4"><PortfolioPanel portfolio={portfolio} watchlistCount={stocks.length} navigate={navigate} /></div>
      </Item>

      {portfolio.error && <ErrorNotice message={`Couldn't load your portfolio: ${portfolio.error}`} onRetry={portfolio.reload} />}

      <Item className="flex flex-wrap gap-2">
        {QUICK.map(({ label, to, icon: Icon }) => (
          <motion.button key={to} onClick={() => navigate(to)} whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}
            className="group flex items-center gap-2 h-10 px-4 rounded-full border border-bg-border bg-bg-secondary/80 text-sm text-text-secondary hover:text-text-primary hover:border-accent-primary/50 hover:shadow-[0_0_22px_rgb(var(--c-primary)/0.2)] transition-all">
            <Icon size={15} className="text-accent-primary group-hover:scale-110 transition-transform" />{label}
          </motion.button>
        ))}
      </Item>

      <Item className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7"><Movers market={market} navigate={navigate} /></div>
        <div className="lg:col-span-5"><Headlines news={news} navigate={navigate} /></div>
      </Item>

      {stocks.length > 0 && (
        <Item>
          <Panel className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-semibold text-xl text-text-primary">Your watchlist</h2>
              <button onClick={() => navigate('/watchlist')} className="text-xs text-accent-primary hover:underline">View all</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {stocks.slice(0, 6).map((s, i) => (
                <MoverRow key={s.symbol} index={i} s={{ symbol: s.symbol, name: s.name, price: s.currentPrice, change: s.change ?? 0 }} max={5} up={(s.change ?? 0) >= 0} onClick={() => navigate(`/company/${encodeURIComponent(s.symbol)}`)} />
              ))}
            </div>
          </Panel>
        </Item>
      )}

      <Item>
        <div className="border-flow rounded-2xl">
          <div className="rounded-[15px] bg-bg-secondary p-6 bg-gradient-to-r from-accent-primary/5 to-accent-secondary/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-semibold text-text-primary text-xl">Ask the AI anything</h3>
                <p className="text-text-secondary text-sm mt-1.5 flex flex-wrap items-center gap-x-1.5">Try <RotatingPrompt /></p>
              </div>
              <motion.button onClick={() => navigate('/chat')} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-primary shrink-0 flex items-center gap-2">
                <Sparkles size={16} /> Open AI chat <ArrowRight size={15} />
              </motion.button>
            </div>
          </div>
        </div>
      </Item>
    </Stagger>
  );
}
