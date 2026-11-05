// MarketTicker.jsx — scrolling live prices (indices first, then the biggest NSE stocks).
// Used at the top of the landing page and inside the app. Pauses on hover. If prices can't be
// fetched it renders an empty bar instead of showing made-up numbers.

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import api from '../../services/api';

const CACHE_KEY = 'finsight:ticker';
const CACHE_MS = 5 * 60 * 1000;

function readCache() {
  try {
    const c = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
    if (c && Date.now() - c.at < CACHE_MS) return c.items;
  } catch { /* ignore corrupt cache */ }
  return null;
}

// `pub` uses the public endpoint so signed-out visitors (landing page) get live prices too
export default function MarketTicker({ pub = false }) {
  const [items, setItems] = useState(() => readCache() || []);

  useEffect(() => {
    if (items.length) return undefined;
    let cancelled = false;
    (pub ? api.market.pulse() : api.market.overview())
      .then((res) => {
        const next = res.ticker || [];
        if (cancelled || !next.length) return;
        setItems(next);
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), items: next })); } catch { /* storage unavailable */ }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [items.length, pub]);

  if (!items.length) return <div className="h-[34px] border-b border-bg-border bg-bg-secondary/80" aria-hidden="true" />;

  const doubled = [...items, ...items];
  return (
    <div className="relative flex items-stretch bg-bg-secondary/90 border-b border-bg-border" aria-label="Live market ticker" role="marquee">
      <div className="relative z-10 flex items-center gap-1.5 pl-3 pr-4 text-[10px] font-bold tracking-widest text-accent-green bg-bg-secondary shrink-0 border-r border-bg-border">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" aria-hidden="true" />
        LIVE
      </div>
      <div className="ticker-wrap flex-1 py-2 relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 z-10 bg-gradient-to-r from-bg-secondary to-transparent" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 z-10 bg-gradient-to-l from-bg-secondary to-transparent" aria-hidden="true" />
        <div className="ticker-content">
          {doubled.map((s, i) => {
            const up = s.change >= 0;
            return (
              <div key={i} className="flex items-center gap-2 shrink-0 px-5 border-r border-bg-border/60" aria-hidden={i >= items.length}>
                <span className="font-mono text-xs text-text-secondary font-semibold tracking-wide">{s.symbol}</span>
                <span className="font-mono text-xs text-text-primary">{s.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                <span className={`inline-flex items-center gap-0.5 text-xs font-mono font-semibold ${up ? 'text-accent-green' : 'text-accent-red'}`}>
                  {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {up ? '+' : ''}{s.change.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
