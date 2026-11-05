// Compare.jsx — put up to 4 stocks side by side: 3-month performance + key metrics

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { X, Scale, Trophy, Plus } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, SectionHeader, EmptyState, ErrorNotice } from '../components/ui';
import StockSearch from '../components/common/StockSearch';
import { Stagger, Item } from '../components/motion';
import { CHART_PALETTE, COLORS } from '../lib/theme';
import api from '../services/api';

const MAX = 4;
const CR = 10_000_000;

const money = (n, cur) => {
  if (n == null) return '—';
  if (cur === 'INR' || !cur) { const cr = n / CR; return cr >= 100000 ? `₹${(cr / 100000).toFixed(2)}L Cr` : `₹${Math.round(cr).toLocaleString('en-IN')} Cr`; }
  return n >= 1e12 ? `$${(n / 1e12).toFixed(2)}T` : `$${(n / 1e9).toFixed(1)}B`;
};

// best: 'high' = bigger wins, 'low' = smaller wins (only compared among positive values where it makes sense)
const METRICS = [
  { key: 'price', label: 'Price', fmt: (c) => `${c.currency === 'USD' ? '$' : '₹'}${c.quote.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` },
  { key: 'changePercent', label: 'Today', get: (c) => c.quote.changePercent, fmt: (c) => `${c.quote.changePercent >= 0 ? '+' : ''}${c.quote.changePercent.toFixed(2)}%`, best: 'high', tone: true },
  { key: 'perf', label: '3-month return', get: (c) => c.perf, fmt: (c) => (c.perf == null ? '—' : `${c.perf >= 0 ? '+' : ''}${c.perf.toFixed(1)}%`), best: 'high', tone: true },
  { key: 'marketCap', label: 'Market cap', get: (c) => c.marketCap, fmt: (c) => money(c.marketCap, c.currency) },
  { key: 'pe', label: 'PE ratio', get: (c) => (c.pe > 0 ? c.pe : null), fmt: (c) => (c.pe == null ? '—' : c.pe.toFixed(1)), best: 'low' },
  { key: 'pb', label: 'PB ratio', get: (c) => (c.pb > 0 ? c.pb : null), fmt: (c) => (c.pb == null ? '—' : c.pb.toFixed(2)), best: 'low' },
  { key: 'roe', label: 'ROE', get: (c) => c.roe, fmt: (c) => (c.roe == null ? '—' : `${c.roe.toFixed(1)}%`), best: 'high' },
  { key: 'netMargin', label: 'Net margin', get: (c) => c.netMargin, fmt: (c) => (c.netMargin == null ? '—' : `${c.netMargin.toFixed(1)}%`), best: 'high' },
  { key: 'revenueGrowth', label: 'Revenue growth', get: (c) => c.revenueGrowth, fmt: (c) => (c.revenueGrowth == null ? '—' : `${c.revenueGrowth.toFixed(1)}%`), best: 'high' },
  { key: 'debtToEquity', label: 'Debt / equity', get: (c) => c.debtToEquity, fmt: (c) => (c.debtToEquity == null ? '—' : c.debtToEquity.toFixed(2)), best: 'low' },
  { key: 'dividendYield', label: 'Dividend yield', get: (c) => c.dividendYield, fmt: (c) => (c.dividendYield == null ? '—' : c.dividendYield > 0 ? `${c.dividendYield.toFixed(2)}%` : 'None'), best: 'high' },
];

const EXAMPLES = [['TCS', 'INFY'], ['HDFCBANK', 'ICICIBANK', 'SBIN'], ['RELIANCE', 'ONGC'], ['MARUTI', 'TMPV', 'M&M']];

// Line the series up by calendar date (Indian and US markets don't trade on the same days),
// start every line at 0% on the first day they ALL have data, and carry the last price across holidays.
function buildSeries(entries) {
  const withChart = entries.filter((e) => e.chart?.length > 1 && e.chart[0].ts);
  if (!withChart.length) return [];

  const day = (ts) => new Date(ts).toISOString().slice(0, 10);
  const start = Math.max(...withChart.map((e) => e.chart[0].ts));
  const maps = withChart.map((e) => new Map(e.chart.filter((p) => p.ts >= start - 36e5).map((p) => [day(p.ts), p])));
  const days = [...new Set(maps.flatMap((m) => [...m.keys()]))].sort();
  if (days.length < 2) return [];

  const base = withChart.map((_, i) => maps[i].get(days.find((d) => maps[i].has(d))).price);
  const last = [...base];
  return days.map((d) => {
    const row = { date: maps.map((m) => m.get(d)?.date).find(Boolean) };
    withChart.forEach((e, i) => {
      const point = maps[i].get(d);
      if (point) last[i] = point.price;
      row[e.symbol] = Number((((last[i] / base[i]) - 1) * 100).toFixed(2));
    });
    return row;
  });
}

export default function Compare() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const symbols = useMemo(() => (params.get('s') || '').split(',').map((x) => x.trim().toUpperCase()).filter(Boolean).slice(0, MAX), [params]);
  const key = symbols.join(',');

  const [loaded, setLoaded] = useState({}); // symbol -> { company, chart } | { error }
  const [retry, setRetry] = useState(0);

  // Fetch whatever we don't have yet
  useEffect(() => {
    let cancelled = false;
    symbols.filter((s) => !loaded[s]).forEach((s) => {
      Promise.all([api.company.getSnapshot(s), api.company.getChart(s, 90)])
        .then(([c, ch]) => !cancelled && setLoaded((m) => ({ ...m, [s]: { company: c.company, chart: ch.data || [] } })))
        .catch((err) => !cancelled && setLoaded((m) => ({ ...m, [s]: { error: err.message } })));
    });
    return () => { cancelled = true; };
    // `loaded` is deliberately omitted: we only want to react to the symbol list changing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, retry]);

  const setSymbols = (list) => setParams(list.length ? { s: list.join(',') } : {}, { replace: true });
  const add = (s) => { if (!symbols.includes(s) && symbols.length < MAX) setSymbols([...symbols, s]); };
  const remove = (s) => setSymbols(symbols.filter((x) => x !== s));

  const entries = symbols.map((s, i) => {
    const l = loaded[s];
    if (!l) return { symbol: s, color: CHART_PALETTE[i], loading: true };
    if (l.error) return { symbol: s, color: CHART_PALETTE[i], error: l.error };
    const first = l.chart[0]?.price;
    const last = l.chart[l.chart.length - 1]?.price;
    return { symbol: s, color: CHART_PALETTE[i], chart: l.chart, c: { ...l.company, perf: first && last ? ((last / first) - 1) * 100 : null } };
  });

  const ready = entries.filter((e) => e.c);
  const series = useMemo(() => buildSeries(ready), [ready.length, key, loaded]); // eslint-disable-line react-hooks/exhaustive-deps
  const anyLoading = entries.some((e) => e.loading);

  // Which symbol wins each row
  const winners = (m) => {
    if (!m.best || ready.length < 2) return new Set();
    const vals = ready.map((e) => ({ s: e.symbol, v: m.get(e.c) })).filter((x) => typeof x.v === 'number');
    if (vals.length < 2) return new Set();
    const target = (m.best === 'high' ? Math.max : Math.min)(...vals.map((x) => x.v));
    return new Set(vals.filter((x) => x.v === target).map((x) => x.s));
  };

  const tally = {};
  METRICS.forEach((m) => winners(m).forEach((s) => { tally[s] = (tally[s] || 0) + 1; }));
  const leader = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];

  return (
    <Stagger className="space-y-6">
      <Item>
        <SectionHeader title="Compare stocks" subtitle={`Pick up to ${MAX} companies to see them side by side`} />

        <Card className="overflow-visible">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1 min-w-0">
              <StockSearch
                key={symbols.length}
                placeholder={symbols.length >= MAX ? `Maximum of ${MAX} reached` : 'Add a company, e.g. Infosys…'}
                onSelect={(s) => add(s.symbol)}
                onEnter={(q) => add(q.toUpperCase())}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <AnimatePresence>
                {entries.map((e) => (
                  <motion.span
                    key={e.symbol}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full border text-sm font-semibold text-text-primary"
                    style={{ borderColor: `${e.color}66`, backgroundColor: `${e.color}1A` }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
                    {e.symbol}
                    <button onClick={() => remove(e.symbol)} aria-label={`Remove ${e.symbol}`} className="p-0.5 rounded-full hover:bg-white/10 text-text-muted hover:text-text-primary"><X size={13} /></button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </Card>
      </Item>

      {symbols.length === 0 && (
        <Item>
          <Card>
            <EmptyState
              icon={Scale}
              title="Nothing to compare yet"
              description="Search for two or more companies above, or start with one of these matchups."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  {EXAMPLES.map((ex) => (
                    <button key={ex.join()} onClick={() => setSymbols(ex)} className="px-3 py-1.5 rounded-lg border border-bg-border text-sm text-text-secondary hover:text-accent-primary hover:border-accent-primary/40 transition-colors">
                      {ex.join(' vs ')}
                    </button>
                  ))}
                </div>
              }
            />
          </Card>
        </Item>
      )}

      {symbols.length === 1 && ready.length === 1 && (
        <Item><p className="text-sm text-text-muted flex items-center gap-2"><Plus size={14} /> Add at least one more company to compare.</p></Item>
      )}

      {entries.filter((e) => e.error).map((e) => (
        <Item key={e.symbol}><ErrorNotice message={`${e.symbol}: ${e.error}`} onRetry={() => { setLoaded((m) => { const n = { ...m }; delete n[e.symbol]; return n; }); setRetry((n) => n + 1); }} /></Item>
      ))}

      {(ready.length > 0 || anyLoading) && (
        <>
          <Item>
            <Card>
              <SectionHeader title="3-month performance" subtitle="Each line starts at 0% so different share prices are comparable" />
              {anyLoading && ready.length === 0 ? (
                <div className="skeleton h-72 w-full" />
              ) : series.length ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={series} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: COLORS.axis, fontSize: 11 }} tickLine={false} axisLine={false} interval={Math.max(0, Math.floor(series.length / 6))} />
                    <YAxis tick={{ fill: COLORS.axis, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} width={48} />
                    <ReferenceLine y={0} stroke={COLORS.axis} strokeDasharray="4 4" />
                    <Tooltip
                      content={({ active, payload, label }) => active && payload?.length ? (
                        <div className="custom-tooltip text-xs space-y-1">
                          <p className="text-text-muted">{label}</p>
                          {[...payload].sort((a, b) => b.value - a.value).map((p) => (
                            <p key={p.dataKey} className="flex items-center gap-2 font-mono"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />{p.dataKey}<span className={p.value >= 0 ? 'text-accent-green ml-auto pl-3' : 'text-accent-red ml-auto pl-3'}>{p.value >= 0 ? '+' : ''}{p.value}%</span></p>
                          ))}
                        </div>
                      ) : null}
                    />
                    {ready.map((e) => (
                      <Line key={e.symbol} type="monotone" dataKey={e.symbol} stroke={e.color} strokeWidth={2.2} dot={false} activeDot={{ r: 4, stroke: COLORS.bg, strokeWidth: 2 }} animationDuration={1000} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : <p className="text-sm text-text-muted py-10 text-center">No price history available for the selected stocks.</p>}
            </Card>
          </Item>

          {ready.length > 0 && (
            <Item>
              <Card>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <SectionHeader title="Key metrics" />
                  {leader && ready.length > 1 && (
                    <motion.p initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-xs text-text-secondary -mt-5">
                      <Trophy size={14} className="text-accent-warn" /> <span><b className="text-text-primary">{leader[0]}</b> leads on {leader[1]} of {METRICS.filter((m) => m.best).length} metrics</span>
                    </motion.p>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[520px]">
                    <thead>
                      <tr className="border-b border-bg-border text-left">
                        <th className="pb-3 pr-4 text-xs text-text-muted font-medium w-40" />
                        {ready.map((e) => (
                          <th key={e.symbol} className="pb-3 pr-4">
                            <button onClick={() => navigate(`/company/${encodeURIComponent(e.symbol)}`)} className="text-left group">
                              <span className="flex items-center gap-2 font-semibold text-text-primary group-hover:text-accent-primary transition-colors"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />{e.symbol}</span>
                              <span className="block text-xs font-normal text-text-muted truncate max-w-[10rem]">{e.c.name}</span>
                            </button>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {METRICS.map((m) => {
                        const win = winners(m);
                        return (
                          <tr key={m.key} className="border-b border-bg-border last:border-0">
                            <td className="py-3 pr-4 text-xs text-text-muted">{m.label}</td>
                            {ready.map((e) => {
                              const v = m.get ? m.get(e.c) : null;
                              const isWin = win.has(e.symbol);
                              const tone = m.tone && typeof v === 'number' ? (v >= 0 ? 'text-accent-green' : 'text-accent-red') : 'text-text-primary';
                              return (
                                <td key={e.symbol} className="py-3 pr-4">
                                  <span className={`inline-flex items-center gap-1.5 font-mono text-sm ${tone} ${isWin ? 'font-bold' : ''}`}>
                                    {m.fmt(e.c)}
                                    {isWin && <Trophy size={11} className="text-accent-warn" aria-label="Best of the group" />}
                                  </span>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {new Set(ready.map((e) => e.c.currency || 'INR')).size > 1 && (
                  <p className="text-xs text-accent-warn mt-4">These companies trade in different currencies. Compare percentage moves and ratios, not absolute prices or market caps.</p>
                )}
                <p className="text-xs text-text-muted mt-4">A trophy marks the best value in each row: higher is better for returns, ROE, margin and yield; lower is better for PE, PB and debt. A &quot;best&quot; is not a recommendation, so context matters (compare within the same sector). Educational only.</p>
              </Card>
            </Item>
          )}
        </>
      )}
    </Stagger>
  );
}
