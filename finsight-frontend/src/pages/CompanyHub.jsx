// CompanyHub.jsx — the Company Analysis home: search, recents, today's movers, browse by sector

import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, History, Flame, Scale, LayoutGrid } from 'lucide-react';
import { Card, SectionHeader, Chips, EmptyState, ErrorNotice, LoadingSkeleton } from '../components/ui';
import { Stagger, Item } from '../components/motion';
import StockSearch from '../components/common/StockSearch';
import StockCard from '../components/common/StockCard';
import { getRecent } from '../lib/recent';
import useApi from '../lib/useApi';
import api from '../services/api';

const fetchUniverse = () => api.screener.get({ limit: 300 });
const PAGE = 12;

export default function CompanyHub() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useApi(fetchUniverse);
  const [sector, setSector] = useState('all');
  const [mover, setMover] = useState('gainers');
  const [visible, setVisible] = useState(PAGE);
  const [recent] = useState(getRecent);

  const stocks = useMemo(() => data?.stocks || [], [data]);
  const open = (symbol) => navigate(`/company/${encodeURIComponent(symbol)}`);

  const sectors = useMemo(() => ['all', ...new Set(stocks.map((s) => s.sector))], [stocks]);
  const byCap = useMemo(() => [...stocks].sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0)), [stocks]);
  const browse = sector === 'all' ? byCap : byCap.filter((s) => s.sector === sector);

  const movers = useMemo(() => {
    const sorted = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
    return mover === 'gainers' ? sorted.slice(0, 6) : sorted.slice(-6).reverse();
  }, [stocks, mover]);

  return (
    <Stagger className="space-y-8">
      {/* Hero search */}
      <Item>
        <Card className="relative overflow-visible bg-gradient-to-br from-accent-primary/10 via-bg-secondary to-accent-secondary/5 border-accent-primary/20">
          <div className="max-w-2xl">
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-text-primary">Company analysis</h1>
            <p className="text-text-secondary text-sm mt-1 mb-5">Search any listed company for live price, key metrics, financials, news and an AI-written analysis.</p>
            <StockSearch
              autoFocus
              placeholder="Search a company or symbol, e.g. Infosys, ZOMATO, AAPL…"
              onSelect={(s) => open(s.symbol)}
              onEnter={(q) => open(q.toUpperCase())}
            />
            <div className="flex items-center gap-3 mt-4 flex-wrap text-xs text-text-muted">
              <span>Try</span>
              {['TCS', 'RELIANCE', 'HDFCBANK', 'ETERNAL', 'TITAN'].map((s) => (
                <button key={s} onClick={() => open(s)} className="px-2.5 py-1 rounded-md border border-bg-border font-mono text-text-secondary hover:text-accent-primary hover:border-accent-primary/40 transition-colors">{s}</button>
              ))}
              <Link to="/compare" className="ml-auto flex items-center gap-1.5 text-accent-primary hover:underline"><Scale size={13} /> Compare stocks</Link>
            </div>
          </div>
        </Card>
      </Item>

      {recent.length > 0 && (
        <Item>
          <SectionHeader title="Recently viewed" />
          <div className="flex gap-2 flex-wrap -mt-2">
            {recent.map((r) => (
              <button key={r.symbol} onClick={() => open(r.symbol)} className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-secondary border border-bg-border hover:border-accent-primary/40 transition-colors">
                <History size={13} className="text-text-muted group-hover:text-accent-primary transition-colors" />
                <span className="text-sm font-semibold text-text-primary">{r.symbol}</span>
                <span className="text-xs text-text-muted hidden sm:inline truncate max-w-[10rem]">{r.name}</span>
              </button>
            ))}
          </div>
        </Item>
      )}

      {error && <ErrorNotice message={`Couldn't load the stock list: ${error}`} onRetry={reload} />}

      {/* Movers */}
      <Item>
        <SectionHeader
          title="Moving today"
          subtitle="Biggest swings across the tracked stocks"
          action={<Chips value={mover} onChange={setMover} options={[{ value: 'gainers', label: 'Gainers' }, { value: 'losers', label: 'Losers' }]} />}
        />
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[0, 1, 2].map((i) => <Card key={i}><LoadingSkeleton lines={4} height="h-5" /></Card>)}</div>
        ) : (
          <Stagger key={mover} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" stagger={0.05}>
            {movers.map((s) => <Item key={s.symbol}><StockCard stock={s} onClick={() => open(s.symbol)} /></Item>)}
          </Stagger>
        )}
      </Item>

      {/* Browse */}
      <Item>
        <SectionHeader title="Browse companies" subtitle={loading ? 'Loading…' : `${browse.length} ${sector === 'all' ? 'companies' : `${sector} companies`}, largest first`} />
        <Chips className="mb-5 -mt-2" value={sector} onChange={(v) => { setSector(v); setVisible(PAGE); }} options={sectors.map((s) => ({ value: s, label: s === 'all' ? 'All sectors' : s }))} />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[0, 1, 2, 3, 4, 5].map((i) => <Card key={i}><LoadingSkeleton lines={4} height="h-5" /></Card>)}</div>
        ) : browse.length === 0 ? (
          <Card><EmptyState icon={LayoutGrid} title="No companies here yet" description="Pick another sector." /></Card>
        ) : (
          <>
            <Stagger key={sector} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" stagger={0.03}>
              {browse.slice(0, visible).map((s) => <Item key={s.symbol}><StockCard stock={s} onClick={() => open(s.symbol)} /></Item>)}
            </Stagger>
            {visible < browse.length && (
              <div className="pt-6 text-center">
                <button onClick={() => setVisible((v) => v + PAGE)} className="btn-secondary text-sm py-2">
                  Show {Math.min(PAGE, browse.length - visible)} more <span className="text-text-muted">({browse.length - visible} left)</span>
                </button>
              </div>
            )}
          </>
        )}
      </Item>

      <Item>
        <p className="flex items-center justify-center gap-2 text-xs text-text-muted"><Flame size={12} /> Can&apos;t find a company? Search covers every NSE-listed stock, not just the ones shown here. <Search size={12} /></p>
      </Item>
    </Stagger>
  );
}
