// Screener.jsx — ~100 large NSE stocks with live prices and fundamentals

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowUp, ArrowDown, SlidersHorizontal, Loader2, RotateCcw } from 'lucide-react';
import { Card, SectionHeader, EmptyState, ErrorNotice, LoadingSkeleton, Chips } from '../components/ui';
import { motion } from 'framer-motion';
import useApi from '../lib/useApi';
import api from '../services/api';

const fetchStocks = () => api.screener.get({ limit: 300 });

const PAGE = 30;
const DEFAULTS = { sector: 'all', cap: 'all', peMax: 100, roeMin: 0 };

const COLUMNS = [
  { col: 'price', label: 'Price' },
  { col: 'changePercent', label: 'Today' },
  { col: 'marketCap', label: 'Mkt cap' },
  { col: 'pe', label: 'PE' },
  { col: 'roe', label: 'ROE %' },
  { col: 'debtEq', label: 'D/E' },
  { col: 'div', label: 'Div %' },
  { col: 'revenueGrowth', label: 'Rev growth' },
];

const dash = <span className="text-text-muted">—</span>;
const fmt = (v, d = 1) => (v == null ? dash : v.toFixed(d));
// marketCap arrives in ₹ crore
const cap = (cr) => (cr == null ? dash : cr >= 100000 ? `₹${(cr / 100000).toFixed(2)}L Cr` : `₹${Math.round(cr).toLocaleString('en-IN')} Cr`);

export default function Screener() {
  const navigate = useNavigate();
  const { data, loading, error, reload, refresh } = useApi(fetchStocks);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('marketCap');
  const [sortDir, setSortDir] = useState('desc');
  const [filters, setFilters] = useState(DEFAULTS);
  const [visible, setVisible] = useState(PAGE);

  // ROE / D/E / growth load in the background on the server; keep polling until they're all in
  const stillLoading = Boolean(data?.loadingFundamentals);
  useEffect(() => {
    if (!stillLoading) return undefined;
    const t = setInterval(refresh, 6000);
    return () => clearInterval(t);
  }, [stillLoading, refresh]);

  const stocks = data?.stocks || [];
  const sectors = ['all', ...new Set(stocks.map((s) => s.sector))];
  const q = search.toLowerCase();
  const filtering = filters.peMax < 100 || filters.roeMin > 0;

  // A slider only filters once it's moved off its default, and stocks missing that metric are left out then
  const matches = stocks.filter((s) =>
    (s.name.toLowerCase().includes(q) || s.symbol.toLowerCase().includes(q)) &&
    (filters.sector === 'all' || s.sector === filters.sector) &&
    (filters.cap === 'all' || s.capClass === filters.cap) &&
    (filters.peMax >= 100 || (s.pe != null && s.pe <= filters.peMax)) &&
    (filters.roeMin <= 0 || (s.roe != null && s.roe >= filters.roeMin)));

  const rows = [...matches].sort((a, b) => {
    if (a[sortBy] == null && b[sortBy] == null) return 0;
    if (a[sortBy] == null) return 1;
    if (b[sortBy] == null) return -1;
    return sortDir === 'desc' ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy];
  });

  const handleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    else { setSortBy(col); setSortDir('desc'); }
  };

  const setFilter = (patch) => { setFilters((f) => ({ ...f, ...patch })); setVisible(PAGE); };
  const dirty = filtering || filters.sector !== 'all' || filters.cap !== 'all' || search;

  return (
    <div className="space-y-5">
      <SectionHeader title="Stock screener" subtitle="Live prices and fundamentals across ~265 NSE companies: large, mid and small caps" />

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="scr-search" className="text-xs text-text-muted mb-1 block">Search</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input id="scr-search" className="input-field pl-8 text-sm h-9" placeholder="Company or symbol" value={search} onChange={(e) => { setSearch(e.target.value); setVisible(PAGE); }} />
            </div>
          </div>
          <div>
            <label htmlFor="scr-sector" className="text-xs text-text-muted mb-1 block">Sector</label>
            <select id="scr-sector" className="input-field text-sm h-9 capitalize" value={filters.sector} onChange={(e) => setFilter({ sector: e.target.value })}>
              {sectors.map((s) => <option key={s} value={s} className="bg-bg-secondary capitalize">{s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="scr-pe" className="text-xs text-text-muted mb-1 block">Max PE: {filters.peMax >= 100 ? 'any' : filters.peMax}</label>
            <input id="scr-pe" type="range" min={5} max={100} value={filters.peMax} onChange={(e) => setFilter({ peMax: +e.target.value })} className="w-full accent-accent-primary mt-2" />
          </div>
          <div>
            <label htmlFor="scr-roe" className="text-xs text-text-muted mb-1 block">Min ROE: {filters.roeMin > 0 ? `${filters.roeMin}%` : 'any'}</label>
            <input id="scr-roe" type="range" min={0} max={50} value={filters.roeMin} onChange={(e) => setFilter({ roeMin: +e.target.value })} className="w-full accent-accent-primary mt-2" />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <span className="text-xs text-text-muted mr-1">Market cap</span>
          <Chips value={filters.cap} onChange={(cap) => setFilter({ cap })} options={[{ value: 'all', label: 'All' }, { value: 'Large', label: 'Large cap' }, { value: 'Mid', label: 'Mid cap' }, { value: 'Small', label: 'Small cap' }]} />
        </div>

        <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
          <p className="text-xs text-text-muted" aria-live="polite">
            {loading ? 'Loading…' : `${rows.length} of ${stocks.length} stocks match`}
            {stillLoading && (
              <span className="inline-flex items-center gap-1.5 ml-3 text-accent-primary">
                <Loader2 size={11} className="animate-spin" /> Loading ROE, debt and growth ({data.stocks.filter((s) => s.roe != null || s.debtEq != null || s.revenueGrowth != null).length}/{stocks.length})
              </span>
            )}
          </p>
          {dirty && (
            <button onClick={() => { setFilters(DEFAULTS); setSearch(''); setVisible(PAGE); }} className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary transition-colors">
              <RotateCcw size={11} /> Reset filters
            </button>
          )}
        </div>
      </Card>

      {error && <ErrorNotice message={`Couldn't load stocks: ${error}`} onRetry={reload} />}

      <Card>
        {loading ? (
          <LoadingSkeleton lines={8} height="h-8" />
        ) : rows.length === 0 ? (
          <EmptyState icon={SlidersHorizontal} title="No stocks match" description="Loosen a filter to see more results." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[860px]">
                <thead>
                  <tr className="border-b border-bg-border text-left">
                    <th className="pb-3 pr-4 text-xs text-text-muted font-medium">Company</th>
                    {COLUMNS.map(({ col, label }) => (
                      <th key={col} className="pb-3 pr-4 text-xs font-medium whitespace-nowrap" aria-sort={sortBy === col ? (sortDir === 'desc' ? 'descending' : 'ascending') : 'none'}>
                        <button onClick={() => handleSort(col)} className={`flex items-center gap-1 transition-colors ${sortBy === col ? 'text-accent-primary' : 'text-text-muted hover:text-text-primary'}`}>
                          {label}
                          {sortBy === col && (sortDir === 'desc' ? <ArrowDown size={11} /> : <ArrowUp size={11} />)}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, visible).map((s, i) => (
                    <motion.tr
                      key={s.symbol}
                      layout="position"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(i, 10) * 0.025 }}
                      onClick={() => navigate(`/company/${encodeURIComponent(s.symbol)}`)}
                      className="border-b border-bg-border last:border-0 hover:bg-bg-tertiary/50 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded bg-bg-tertiary border border-bg-border flex items-center justify-center text-xs font-bold font-mono text-accent-primary">{s.symbol[0]}</div>
                          <div>
                            <p className="font-semibold text-text-primary group-hover:text-accent-primary transition-colors text-xs">{s.symbol}</p>
                            <p className="text-text-muted text-xs">{s.sector}{s.capClass ? ` · ${s.capClass}` : ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-mono text-xs text-text-primary">₹{s.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td className={`py-3 pr-4 font-mono text-xs font-semibold ${s.changePercent >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                        {s.changePercent >= 0 ? '+' : ''}{s.changePercent.toFixed(2)}%
                      </td>
                      <td className="py-3 pr-4 font-mono text-xs text-text-secondary whitespace-nowrap">{cap(s.marketCap)}</td>
                      <td className="py-3 pr-4 font-mono text-xs text-text-primary">{fmt(s.pe)}</td>
                      <td className="py-3 pr-4 font-mono text-xs text-accent-green">{s.roe == null ? dash : `${s.roe.toFixed(1)}%`}</td>
                      <td className="py-3 pr-4 font-mono text-xs text-text-secondary">{fmt(s.debtEq, 2)}</td>
                      <td className="py-3 pr-4 font-mono text-xs text-accent-primary">{s.div == null ? dash : `${s.div.toFixed(2)}%`}</td>
                      <td className="py-3 pr-4 font-mono text-xs">
                        {s.revenueGrowth == null ? dash : (
                          <span className={s.revenueGrowth >= 0 ? 'text-accent-green' : 'text-accent-red'}>{s.revenueGrowth >= 0 ? '+' : ''}{s.revenueGrowth.toFixed(1)}%</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {visible < rows.length && (
              <div className="pt-4 text-center">
                <button onClick={() => setVisible((v) => v + PAGE)} className="btn-secondary text-sm py-2">
                  Show {Math.min(PAGE, rows.length - visible)} more <span className="text-text-muted">({rows.length - visible} left)</span>
                </button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
