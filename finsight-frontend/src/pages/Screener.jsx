// Screener.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowUp, ArrowDown, SlidersHorizontal } from 'lucide-react';
import { Card, SectionHeader, EmptyState, ErrorNotice, LoadingSkeleton } from '../components/ui';
import { motion } from 'framer-motion';
import useApi from '../lib/useApi';
import api from '../services/api';

const fetchStocks = () => api.screener.get({ limit: 20 });

const COLUMNS = [
  { col: 'marketCap', label: 'Mkt cap (Cr)' },
  { col: 'pe', label: 'PE' },
  { col: 'roe', label: 'ROE %' },
  { col: 'debtEq', label: 'D/E' },
  { col: 'div', label: 'Div yield %' },
  { col: 'revenueGrowth', label: 'Rev growth %' },
];

export default function Screener() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useApi(fetchStocks);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('marketCap');
  const [sortDir, setSortDir] = useState('desc');
  const [filters, setFilters] = useState({ sector: 'all', peMax: 100, roeMin: 0 });

  const stocks = data?.stocks || [];
  const sectors = ['all', ...new Set(stocks.map((s) => s.sector))];
  const q = search.toLowerCase();

  const rows = stocks
    .filter((s) =>
      (s.name.toLowerCase().includes(q) || s.symbol.toLowerCase().includes(q)) &&
      (filters.sector === 'all' || s.sector === filters.sector) &&
      s.pe <= filters.peMax &&
      s.roe >= filters.roeMin)
    .sort((a, b) => (sortDir === 'desc' ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy]));

  const handleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    else { setSortBy(col); setSortDir('desc'); }
  };

  return (
    <div className="space-y-5">
      <SectionHeader title="Stock screener" subtitle="Filter stocks by sector, valuation and returns" />

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="scr-search" className="text-xs text-text-muted mb-1 block">Search</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input id="scr-search" className="input-field pl-8 text-sm h-9" placeholder="Company or symbol" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div>
            <label htmlFor="scr-sector" className="text-xs text-text-muted mb-1 block">Sector</label>
            <select id="scr-sector" className="input-field text-sm h-9 capitalize" value={filters.sector} onChange={(e) => setFilters((f) => ({ ...f, sector: e.target.value }))}>
              {sectors.map((s) => <option key={s} value={s} className="bg-bg-secondary capitalize">{s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="scr-pe" className="text-xs text-text-muted mb-1 block">Max PE: {filters.peMax}</label>
            <input id="scr-pe" type="range" min={5} max={100} value={filters.peMax} onChange={(e) => setFilters((f) => ({ ...f, peMax: +e.target.value }))} className="w-full accent-accent-primary mt-2" />
          </div>
          <div>
            <label htmlFor="scr-roe" className="text-xs text-text-muted mb-1 block">Min ROE: {filters.roeMin}%</label>
            <input id="scr-roe" type="range" min={0} max={50} value={filters.roeMin} onChange={(e) => setFilters((f) => ({ ...f, roeMin: +e.target.value }))} className="w-full accent-accent-primary mt-2" />
          </div>
        </div>
        <p className="text-xs text-text-muted mt-3" aria-live="polite">{loading ? 'Loading…' : `${rows.length} of ${stocks.length} stocks match`}</p>
      </Card>

      {error && <ErrorNotice message={`Couldn't load stocks: ${error}`} onRetry={reload} />}

      <Card>
        {loading ? (
          <LoadingSkeleton lines={6} height="h-8" />
        ) : rows.length === 0 ? (
          <EmptyState icon={SlidersHorizontal} title="No stocks match" description="Loosen a filter to see more results." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
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
                {rows.map((s, i) => (
                  <motion.tr
                    key={s.symbol}
                    layout="position"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(i, 10) * 0.025 }}
                    onClick={() => navigate(`/company/${s.symbol}`)}
                    className="border-b border-bg-border last:border-0 hover:bg-bg-tertiary/50 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-bg-tertiary border border-bg-border flex items-center justify-center text-xs font-bold font-mono text-accent-primary">{s.symbol[0]}</div>
                        <div>
                          <p className="font-semibold text-text-primary group-hover:text-accent-primary transition-colors text-xs">{s.symbol}</p>
                          <p className="text-text-muted text-xs">{s.sector}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-text-secondary">{(s.marketCap / 1000).toFixed(0)}K</td>
                    <td className="py-3 pr-4 font-mono text-xs text-text-primary">{s.pe}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-accent-green">{s.roe}%</td>
                    <td className="py-3 pr-4 font-mono text-xs text-text-secondary">{s.debtEq}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-accent-primary">{s.div}%</td>
                    <td className="py-3 pr-4 font-mono text-xs">
                      <span className={s.revenueGrowth > 0 ? 'text-accent-green' : 'text-accent-red'}>{s.revenueGrowth > 0 ? '+' : ''}{s.revenueGrowth}%</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
