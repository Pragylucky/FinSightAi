// Company.jsx — one company: quote, chart, financials, AI analysis, news

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Star, StarOff, Share2, Scale, Check, CheckCircle2, XCircle, Zap, AlertTriangle, ChevronDown, ChevronUp, SearchX, Info } from 'lucide-react';
import { Card, Badge, Tabs, RiskMeter, SectionHeader, EmptyState, LoadingSkeleton } from '../components/ui';
import useApi from '../lib/useApi';
import { timeAgo } from '../lib/format';
import { addRecent } from '../lib/recent';
import StockSearch from '../components/common/StockSearch';
import { StockChart, VolumeChart } from '../components/charts';
import { motion } from 'framer-motion';
import { Stagger, Item, CountUp } from '../components/motion';
import { EASE } from '../lib/motion';
import track from '../lib/track';
import Feedback from '../components/common/Feedback';
import api from '../services/api';

const CR = 10_000_000; // 1 crore

// Market cap / revenue arrive as raw numbers in the stock's currency.
function money(n, currency = 'INR') {
  if (typeof n !== 'number' || !Number.isFinite(n) || n === 0) return '—';
  if (currency === 'INR') {
    const cr = n / CR;
    if (cr >= 100000) return `₹${(cr / 100000).toFixed(2)} L Cr`;
    return `₹${cr.toLocaleString('en-IN', { maximumFractionDigits: 0 })} Cr`;
  }
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  return `$${(n / 1e6).toFixed(0)}M`;
}
const fixed = (n, d = 2) => (typeof n === 'number' && Number.isFinite(n) && n !== 0 ? n.toFixed(d) : '—');
const crore = (n) => (typeof n === 'number' ? (n / CR).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '—');
const growth = (cur, prev) => (cur && prev ? ((cur - prev) / Math.abs(prev)) * 100 : null);

function MetricBox({ label, value, highlight = false }) {
  return (
    <div className="bg-bg-tertiary rounded-lg p-3 border border-bg-border">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <p className={`font-mono font-bold text-sm ${highlight ? 'text-accent-primary' : 'text-text-primary'}`}>{value}</p>
    </div>
  );
}

function ProsConsItem({ text, type }) {
  const pro = type === 'pro';
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg ${pro ? 'bg-accent-green/5 border border-accent-green/15' : 'bg-accent-red/5 border border-accent-red/15'}`}>
      {pro ? <CheckCircle2 size={15} className="text-accent-green mt-0.5 shrink-0" /> : <XCircle size={15} className="text-accent-red mt-0.5 shrink-0" />}
      <p className="text-sm text-text-secondary leading-relaxed">{text}</p>
    </div>
  );
}

function Growth({ value }) {
  if (value == null) return <span className="text-text-muted">—</span>;
  return <span className={value >= 0 ? 'text-accent-green' : 'text-accent-red'}>{value >= 0 ? '+' : ''}{value.toFixed(1)}%</span>;
}

// AI analysis loads on its own (it can take several seconds) so the rest of the page is never held up.
function AiAnalysis({ sym }) {
  const fetchAnalysis = useCallback(() => api.company.getAnalysis(sym), [sym]);
  const { data, loading, error, reload } = useApi(fetchAnalysis);
  const ai = data?.analysis;

  if (loading) {
    return (
      <Card className="border-accent-secondary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-accent-secondary/20 flex items-center justify-center"><Zap size={16} className="text-accent-secondary animate-pulse" /></div>
          <div>
            <h3 className="font-display font-semibold text-text-primary">Analysing {sym}…</h3>
            <p className="text-text-muted text-xs">This usually takes a few seconds</p>
          </div>
        </div>
        <LoadingSkeleton lines={4} />
      </Card>
    );
  }

  if (error || !ai) {
    return (
      <Card>
        <EmptyState icon={Zap} title="AI analysis unavailable" description={error || 'No analysis came back for this company.'} action={<button onClick={reload} className="btn-secondary text-sm py-2">Try again</button>} />
      </Card>
    );
  }

  return (
    <>
      <Card className="border-accent-secondary/20 bg-gradient-to-br from-accent-secondary/5 to-transparent">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-accent-secondary/20 flex items-center justify-center"><Zap size={16} className="text-accent-secondary" /></div>
          <h3 className="font-display font-semibold text-text-primary">AI summary</h3>
          <Badge variant="secondary" className="ml-auto">AI generated</Badge>
        </div>
        <p className="text-text-secondary text-sm leading-relaxed">{ai.summary}</p>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <p className="text-text-muted text-sm mb-2">Outlook</p>
          <Badge variant={ai.outlook === 'Positive' ? 'green' : ai.outlook === 'Neutral' ? 'warn' : 'red'} className="text-base px-4 py-1.5">{ai.outlook}</Badge>
        </Card>
        {typeof ai.riskScore === 'number' && <Card><RiskMeter score={ai.riskScore} /></Card>}
      </div>

      {ai.pros?.length > 0 && (
        <Card>
          <SectionHeader title="Strengths" />
          <Stagger className="space-y-2" stagger={0.07}>{ai.pros.map((p, i) => <Item key={i}><ProsConsItem text={p} type="pro" /></Item>)}</Stagger>
        </Card>
      )}
      {ai.cons?.length > 0 && (
        <Card>
          <SectionHeader title="Risks and concerns" />
          <Stagger className="space-y-2" stagger={0.07}>{ai.cons.map((p, i) => <Item key={i}><ProsConsItem text={p} type="con" /></Item>)}</Stagger>
        </Card>
      )}
      <Card>
        <details className="group">
          <summary className="cursor-pointer text-sm text-text-secondary hover:text-text-primary list-none flex items-center gap-2">
            <Info size={14} className="text-accent-primary" /> What is this based on?
            <span className="ml-auto text-xs text-text-muted">{ai.model ? `${ai.model} · ` : ''}{ai.generatedAt ? new Date(ai.generatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : ''}</span>
          </summary>
          <p className="text-xs text-text-muted mt-3 mb-2">The model was shown only these figures and told not to invent any others:</p>
          {ai.inputs && (
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-xs">
              {Object.entries(ai.inputs).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2 border-b border-bg-border/60 py-1">
                  <dt className="text-text-muted">{k}</dt>
                  <dd className="font-mono text-text-secondary truncate">{String(v)}</dd>
                </div>
              ))}
            </dl>
          )}
        </details>
        <div className="mt-4 pt-3 border-t border-bg-border flex items-center justify-between gap-3">
          <span className="text-xs text-text-muted">Was this analysis useful?</span>
          <Feedback kind="analysis" refId={sym} />
        </div>
      </Card>
      <div className="flex items-start gap-2 p-3 bg-accent-warn/5 border border-accent-warn/20 rounded-lg">
        <AlertTriangle size={15} className="text-accent-warn shrink-0 mt-0.5" />
        <p className="text-xs text-text-muted leading-relaxed">Generated by AI from public data. For education only, not financial advice. Do your own research before investing.</p>
      </div>
    </>
  );
}

// Keyed by symbol so navigating between companies remounts with fresh state.
export default function Company() {
  const { symbol = 'TCS' } = useParams();
  return <CompanyView key={symbol.toUpperCase()} sym={symbol.toUpperCase()} />;
}

function CompanyView({ sym }) {
  const navigate = useNavigate();

  const [tab, setTab] = useState('overview');
  const [state, setState] = useState({ company: null, chart: [], loading: true, error: '' });
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchMsg, setWatchMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [fullSummary, setFullSummary] = useState(false);
  useEffect(() => { if (tab === 'ai') track('ai_tab_open'); }, [tab, sym]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.company.get(sym), api.company.getChart(sym, 30)])
      .then(([c, ch]) => {
        if (cancelled) return;
        addRecent(sym, c.company?.name);
        track('company_view');
        setState({ company: c.company, chart: ch.data || [], loading: false, error: '' });
      })
      .catch((err) => !cancelled && setState({ company: null, chart: [], loading: false, error: err.message }));
    return () => { cancelled = true; };
  }, [sym]);

  // Is this stock already on the user's watchlist?
  useEffect(() => {
    let cancelled = false;
    api.watchlist.get()
      .then((r) => !cancelled && setInWatchlist((r.watchlist?.stocks || []).some((s) => s.symbol === sym)))
      .catch(() => !cancelled && setInWatchlist(false));
    return () => { cancelled = true; };
  }, [sym]);

  const loadRange = useCallback(async (days) => {
    try {
      const r = await api.company.getChart(sym, days);
      setState((s) => ({ ...s, chart: r.data || [] }));
    } catch { /* keep the current chart */ }
  }, [sym]);

  const toggleWatchlist = async () => {
    const c = state.company;
    if (!c) return;
    setWatchMsg('');
    try {
      if (inWatchlist) await api.watchlist.remove(sym);
      else await api.watchlist.add({ symbol: sym, name: c.name });
      setInWatchlist(!inWatchlist);
    } catch (err) {
      setWatchMsg(err.message);
    }
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked */ }
  };

  const { company: c, chart, loading, error } = state;

  if (loading) {
    return (
      <div className="space-y-5">
        <Card><div className="space-y-4"><div className="skeleton h-10 w-48" /><div className="skeleton h-9 w-64" /><LoadingSkeleton lines={2} /></div></Card>
        <Card><div className="skeleton h-72 w-full" /></Card>
      </div>
    );
  }

  if (error || !c) {
    return (
      <Card className="overflow-visible">
        <EmptyState
          icon={SearchX}
          title={`Couldn't load ${sym}`}
          description={error || 'No data came back for this symbol.'}
          action={
            <div className="w-full max-w-sm space-y-4">
              <StockSearch placeholder="Search another company…" onSelect={(s) => navigate(`/company/${encodeURIComponent(s.symbol)}`)} onEnter={(q) => navigate(`/company/${encodeURIComponent(q.toUpperCase())}`)} />
              <div className="flex justify-center gap-3">
                <button onClick={() => window.location.reload()} className="btn-secondary text-sm py-2">Try again</button>
                <Link to="/company" className="btn-ghost text-sm py-2">Browse companies</Link>
              </div>
            </div>
          }
        />
      </Card>
    );
  }

  const q = c.quote || {};
  const currency = c.currency || 'INR';
  const cur = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : '';
  const price = q.price ?? 0;
  const isPositive = (q.changePercent ?? 0) >= 0;
  const news = c.news || [];

  // Newest first; growth is vs the next (older) entry
  const results = (c.quarterlyResults || []).map((r, i, arr) => ({
    ...r,
    revG: growth(r.revenue, arr[i + 1]?.revenue),
    profG: growth(r.netIncome, arr[i + 1]?.netIncome),
    margin: r.revenue && r.operatingIncome ? (r.operatingIncome / r.revenue) * 100 : null,
  })).slice(0, 4); // the 5th (oldest) row only exists so the 4th row has something to compare with

  const range = c.week52High && c.week52Low ? c.week52High - c.week52Low : 0;
  const rangePos = range > 0 ? Math.min(100, Math.max(0, ((price - c.week52Low) / range) * 100)) : null;

  const tabs = [
    { label: 'Overview', value: 'overview' },
    { label: 'Financials', value: 'financials' },
    { label: 'AI analysis', value: 'ai' },
    { label: 'News', value: 'news' },
  ];

  const quick = [
    ['Open', q.open], ['High', q.high], ['Low', q.low], ['Prev close', q.prevClose],
    ['Volume', q.volume ? q.volume.toLocaleString('en-IN') : null],
    ['52W high', c.week52High], ['52W low', c.week52Low],
  ];

  return (
    <Stagger className="space-y-5" stagger={0.06}>
      <Item>
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-11 h-11 rounded-lg bg-bg-tertiary border border-bg-border flex items-center justify-center">
                  <span className="font-mono font-bold text-accent-primary">{sym[0]}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-display font-bold text-xl text-text-primary">{sym}</h1>
                    {c.sector && c.sector !== 'Unknown' && <Badge variant="primary">{c.sector}</Badge>}
                  </div>
                  <p className="text-text-secondary text-sm truncate">{c.name}</p>
                </div>
              </div>

              <div className="flex items-end gap-3 mt-3 flex-wrap">
                <span className="font-mono font-bold text-3xl text-text-primary">
                  <CountUp key={sym} value={price} decimals={2} prefix={cur} />
                </span>
                <div className={`flex items-center gap-1 pb-1 font-mono font-semibold ${isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
                  {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {isPositive ? '+' : ''}{cur}{(q.change ?? 0).toFixed(2)} ({isPositive ? '+' : ''}{(q.changePercent ?? 0).toFixed(2)}%)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={toggleWatchlist}
                aria-pressed={inWatchlist}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  inWatchlist ? 'bg-accent-warn/10 border-accent-warn/30 text-accent-warn' : 'border-bg-border text-text-secondary hover:border-accent-warn/30 hover:text-accent-warn'
                }`}
              >
                {inWatchlist ? <Star size={15} fill="currentColor" /> : <StarOff size={15} />}
                {inWatchlist ? 'Watching' : 'Watchlist'}
              </motion.button>
              <Link to={`/compare?s=${encodeURIComponent(sym)}`} className="flex items-center gap-2 px-3 py-2 border border-bg-border rounded-lg text-sm text-text-secondary hover:text-accent-primary hover:border-accent-primary/40 transition-colors"><Scale size={15} /> <span className="hidden sm:inline">Compare</span></Link>
              <button onClick={share} aria-label="Copy link" title="Copy link" className="p-2 border border-bg-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors">
                {copied ? <Check size={16} className="text-accent-green" /> : <Share2 size={16} />}
              </button>
            </div>
          </div>
          {watchMsg && <p role="alert" className="text-xs text-accent-red mt-3">{watchMsg}</p>}

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-5 pt-4 border-t border-bg-border text-xs">
            {quick.map(([l, v]) => (
              <div key={l}>
                <p className="text-text-muted">{l}</p>
                <p className="font-mono font-semibold text-text-primary mt-0.5">
                  {typeof v === 'number' && v ? `${cur}${v.toLocaleString('en-IN')}` : typeof v === 'string' ? v : '—'}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </Item>

      <Item><Tabs tabs={tabs} activeTab={tab} onChange={setTab} /></Item>

      <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }} className="space-y-5">
        {tab === 'overview' && (
          <>
            <Card>
              <SectionHeader title="Price chart" subtitle={`${sym}${currency === 'INR' ? ' · NSE' : ''}`} />
              <StockChart isPositive={isPositive} chartData={chart} onRangeChange={loadRange} />
              {chart.length > 0 && (
                <div className="mt-3 border-t border-bg-border pt-3">
                  <p className="text-xs text-text-muted mb-1">Volume</p>
                  <VolumeChart chartData={chart} />
                </div>
              )}
            </Card>

            {c.description && (
              <Card>
                <SectionHeader title="About" subtitle={c.industry && c.industry !== 'Unknown' ? c.industry : undefined} />
                <p className={`text-sm text-text-secondary leading-relaxed ${fullSummary ? '' : 'line-clamp-4'}`}>{c.description}</p>
                <button onClick={() => setFullSummary(!fullSummary)} className="flex items-center gap-1 text-xs text-accent-primary mt-2 hover:underline">
                  {fullSummary ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Read more</>}
                </button>
              </Card>
            )}

            <Card>
              <SectionHeader title="Key metrics" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <MetricBox label="Market cap" value={money(c.marketCap, currency)} highlight />
                <MetricBox label="PE ratio" value={fixed(c.pe)} />
                <MetricBox label="PB ratio" value={fixed(c.pb)} />
                <MetricBox label="EPS (TTM)" value={c.eps ? `${cur}${fixed(c.eps)}` : '—'} />
                <MetricBox label="Dividend yield" value={c.dividendYield == null ? '—' : c.dividendYield > 0 ? `${c.dividendYield.toFixed(2)}%` : 'None'} />
                <MetricBox label="ROE" value={c.roe ? `${c.roe.toFixed(1)}%` : '—'} highlight />
                <MetricBox label="Debt / equity" value={fixed(c.debtToEquity)} />
                <MetricBox label="Revenue (TTM)" value={money(c.revenue, currency)} />
              </div>
            </Card>

            {rangePos !== null && (
              <Card>
                <SectionHeader title="52-week range" />
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-mono text-accent-red">{cur}{c.week52Low.toLocaleString('en-IN')}</span>
                    <span className="font-mono text-accent-green">{cur}{c.week52High.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="relative h-3 bg-bg-tertiary rounded-full">
                    <div className="h-full rounded-full bg-gradient-to-r from-accent-red via-accent-warn to-accent-green opacity-80" />
                    <motion.div
                      className="absolute top-1/2 w-4 h-4 rounded-full bg-white border-2 border-bg-primary shadow-lg shadow-black/50"
                      style={{ translateX: '-50%', translateY: '-50%' }}
                      initial={{ left: '0%' }}
                      animate={{ left: `${rangePos}%` }}
                      transition={{ duration: 1, ease: EASE }}
                    />
                  </div>
                  <p className="text-center text-xs text-text-muted">Current <span className="font-mono text-text-primary font-semibold">{cur}{price.toLocaleString('en-IN')}</span></p>
                </div>
              </Card>
            )}
          </>
        )}

        {tab === 'financials' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <p className="text-text-muted text-sm mb-1">Latest quarter revenue</p>
                <p className="font-mono font-bold text-2xl text-text-primary">{results[0]?.revenue ? `₹${crore(results[0].revenue)} Cr` : '—'}</p>
              </Card>
              <Card>
                <p className="text-text-muted text-sm mb-1">Latest quarter net profit</p>
                <p className="font-mono font-bold text-2xl text-text-primary">{results[0]?.netIncome ? `₹${crore(results[0].netIncome)} Cr` : '—'}</p>
              </Card>
            </div>

            <Card>
              <SectionHeader title="Quarterly results" subtitle="Revenue and profit, ₹ crore" />
              {results.length === 0 ? (
                <p className="text-sm text-text-muted py-6 text-center">No quarterly results available for this company.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] text-sm">
                    <thead>
                      <tr className="border-b border-bg-border text-left">
                        {['Quarter', 'Revenue', 'Rev growth', 'Net profit', 'Profit growth', 'Op. margin'].map((h) => (
                          <th key={h} className="pb-3 px-2 text-text-muted text-xs font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r, i) => (
                        <tr key={i} className="border-b border-bg-border last:border-0 hover:bg-bg-tertiary/40 transition-colors">
                          <td className="py-3 px-2 font-medium text-text-primary font-mono text-xs">
                            {new Date(r.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                          </td>
                          <td className="py-3 px-2 font-mono text-xs text-text-primary">{crore(r.revenue)}</td>
                          <td className="py-3 px-2 font-mono text-xs"><Growth value={r.revG} /></td>
                          <td className="py-3 px-2 font-mono text-xs text-text-primary">{r.netIncome ? crore(r.netIncome) : '—'}</td>
                          <td className="py-3 px-2 font-mono text-xs"><Growth value={r.profG} /></td>
                          <td className="py-3 px-2 font-mono text-xs text-accent-primary">{r.margin == null ? '—' : `${r.margin.toFixed(1)}%`}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            <Card>
              <SectionHeader title="Valuation and efficiency" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <MetricBox label="PE ratio" value={fixed(c.pe)} highlight />
                <MetricBox label="Forward PE" value={fixed(c.forwardPE)} />
                <MetricBox label="PB ratio" value={fixed(c.pb)} />
                <MetricBox label="ROE" value={c.roe ? `${c.roe.toFixed(1)}%` : '—'} highlight />
                <MetricBox label="Net margin" value={c.netMargin ? `${c.netMargin.toFixed(1)}%` : '—'} />
                <MetricBox label="Revenue growth" value={c.revenueGrowth ? `${c.revenueGrowth.toFixed(1)}%` : '—'} />
              </div>
            </Card>
          </>
        )}

        {tab === 'ai' && <AiAnalysis sym={sym} />}

        {tab === 'news' && (
          <Card>
            <SectionHeader title={`${sym} news`} />
            {news.length === 0 ? (
              <p className="text-sm text-text-muted py-6 text-center">No recent news for this company.</p>
            ) : (
              <div>
                {news.map((n, i) => (
                  <a key={i} href={n.url} target="_blank" rel="noopener noreferrer" className="block py-3 border-b border-bg-border last:border-0 group">
                    <p className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">{n.title}</p>
                    <p className="text-xs text-text-muted mt-1">
                      {n.source}{n.time ? ` · ${timeAgo(n.time)}` : ''}
                    </p>
                  </a>
                ))}
              </div>
            )}
          </Card>
        )}
      </motion.div>
    </Stagger>
  );
}
