// Watchlist.jsx

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Star } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Card, SectionHeader, Badge, EmptyState, ErrorNotice, LoadingSkeleton } from '../components/ui';
import { motion } from 'framer-motion';
import { EASE } from '../lib/motion';
import AddWatchlistModal from '../components/watchlist/AddWatchlistModal';
import useApi from '../lib/useApi';
import api from '../services/api';

const fetchWatchlist = () => api.watchlist.get();

export default function Watchlist() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useApi(fetchWatchlist, { allow404: true });
  const [showAdd, setShowAdd] = useState(false);
  const [removed, setRemoved] = useState([]);
  const [actionError, setActionError] = useState('');

  const items = (data?.watchlist?.stocks || []).filter((s) => !removed.includes(s.symbol));

  const remove = useCallback(async (symbol) => {
    setActionError('');
    setRemoved((r) => [...r, symbol]); // optimistic
    try {
      await api.watchlist.remove(symbol);
    } catch (err) {
      setRemoved((r) => r.filter((x) => x !== symbol));
      setActionError(err.message);
    }
  }, []);

  const refresh = async () => { await reload(); setRemoved([]); };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Watchlist"
        subtitle={loading ? 'Loading…' : `${items.length} ${items.length === 1 ? 'stock' : 'stocks'} tracked`}
        action={
          <button onClick={() => setShowAdd(true)} className="btn-secondary text-sm py-2 flex items-center gap-2">
            <Plus size={15} /> Add stock
          </button>
        }
      />

      {error && <ErrorNotice message={`Couldn't load your watchlist: ${error}`} onRetry={reload} />}
      {actionError && <ErrorNotice message={actionError} />}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[0, 1].map((i) => <Card key={i}><LoadingSkeleton lines={4} height="h-6" /></Card>)}</div>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={Star}
            title="Your watchlist is empty"
            description="Add stocks you want to keep an eye on."
            action={<button onClick={() => setShowAdd(true)} className="btn-primary text-sm py-2">Add a stock</button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {items.map((item, i) => {
              const change = typeof item.change === 'number' ? item.change : null;
              const pos = (change ?? 0) >= 0;
              const target = item.targetPrice;
              const upside = target && item.currentPrice ? (target / item.currentPrice - 1) * 100 : null;
              const nearTarget = target && item.currentPrice && item.currentPrice >= target * 0.95;

              return (
                <motion.div
                  key={item.symbol}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, ease: EASE, delay: i * 0.05 }}
                >
                  <Card hover className="group h-full">
                    <div className="flex items-start justify-between mb-3">
                      <button className="flex items-center gap-3 text-left" onClick={() => navigate(`/company/${item.symbol}`)}>
                        <div className="w-10 h-10 rounded-lg bg-bg-tertiary border border-bg-border flex items-center justify-center text-sm font-bold font-mono text-accent-primary">{item.symbol[0]}</div>
                        <div>
                          <p className="font-semibold text-text-primary group-hover:text-accent-primary transition-colors">{item.symbol}</p>
                          <p className="text-xs text-text-muted">{item.name}</p>
                        </div>
                      </button>
                      <button
                        onClick={() => remove(item.symbol)}
                        aria-label={`Remove ${item.symbol}`}
                        className="p-1.5 rounded-md text-text-muted hover:text-accent-red hover:bg-accent-red/10 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="font-mono font-bold text-xl text-text-primary">
                          {item.currentPrice != null ? `₹${item.currentPrice.toLocaleString('en-IN')}` : '—'}
                        </p>
                        {change != null && (
                          <p className={`text-sm font-mono font-semibold ${pos ? 'text-accent-green' : 'text-accent-red'}`}>
                            {pos ? '+' : ''}{change.toFixed(2)}%
                          </p>
                        )}
                      </div>
                      {target ? (
                        <div className="text-right">
                          <p className="text-xs text-text-muted">Target</p>
                          <p className="font-mono font-semibold text-accent-primary text-sm">₹{target.toLocaleString('en-IN')}</p>
                          {upside != null && <p className="text-xs text-text-muted">{upside >= 0 ? `${upside.toFixed(1)}% upside` : `${Math.abs(upside).toFixed(1)}% above target`}</p>}
                        </div>
                      ) : (
                        <p className="text-xs text-text-muted">No target set</p>
                      )}
                    </div>

                    {(item.pe || item.sector || item.marketCap) && (
                      <div className="mt-3 pt-3 border-t border-bg-border flex items-center justify-between gap-2 text-xs text-text-muted flex-wrap">
                        {item.pe ? <span>PE <span className="text-text-secondary font-mono">{item.pe}</span></span> : null}
                        {item.sector ? <Badge>{item.sector}</Badge> : null}
                        {item.marketCap ? <span>MCap <span className="text-text-secondary">{item.marketCap}</span></span> : null}
                      </div>
                    )}

                    {nearTarget && (
                      <div className="mt-3 px-2 py-1.5 bg-accent-green/10 border border-accent-green/20 rounded text-xs text-accent-green">
                        Within 5% of your target price
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <AddWatchlistModal open={showAdd} onClose={() => setShowAdd(false)} onSuccess={refresh} />
    </div>
  );
}
