// News.jsx — market headlines with search, category, sentiment and stock filters

import { useMemo, useState } from 'react';
import { Newspaper, Search, X, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, SectionHeader, Badge, Chips, EmptyState, ErrorNotice, LoadingSkeleton } from '../components/ui';
import { EASE } from '../lib/motion';
import useApi from '../lib/useApi';
import { timeAgo } from '../lib/format';
import api from '../services/api';

const fetchNews = () => api.news.get();
const sentimentVariant = { bullish: 'green', bearish: 'red', neutral: 'warn' };

const SENTIMENTS = [
  { value: 'all', label: 'All moods' },
  { value: 'bullish', label: 'Bullish' },
  { value: 'bearish', label: 'Bearish' },
  { value: 'neutral', label: 'Neutral' },
];

const SORTS = [
  { value: 'latest', label: 'Latest' },
  { value: 'bullish', label: 'Most bullish' },
  { value: 'bearish', label: 'Most bearish' },
];

export default function News() {
  const { data, loading, error, reload } = useApi(fetchNews);
  const [category, setCategory] = useState('all');
  const [sentiment, setSentiment] = useState('all');
  const [stock, setStock] = useState('');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('latest');

  const all = useMemo(() => data?.news || [], [data]);

  // Chips are built from what's actually in the feed, with counts
  const categories = useMemo(() => {
    const counts = {};
    all.forEach((n) => { if (n.category) counts[n.category] = (counts[n.category] || 0) + 1; });
    return [{ value: 'all', label: `All (${all.length})` }, ...Object.entries(counts).map(([c, n]) => ({ value: c, label: `${c} (${n})` }))];
  }, [all]);

  const topStocks = useMemo(() => {
    const counts = {};
    all.forEach((n) => (n.relatedStocks || []).forEach((s) => { counts[s] = (counts[s] || 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([s]) => s);
  }, [all]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = all.filter((n) =>
      (category === 'all' || n.category === category) &&
      (sentiment === 'all' || n.sentiment === sentiment) &&
      (!stock || (n.relatedStocks || []).includes(stock)) &&
      (!q || `${n.title} ${n.summary} ${n.source}`.toLowerCase().includes(q)));

    const by = {
      latest: (a, b) => new Date(b.time) - new Date(a.time),
      bullish: (a, b) => b.bullishScore - a.bullishScore,
      bearish: (a, b) => b.bearishScore - a.bearishScore,
    }[sort];
    return [...list].sort(by);
  }, [all, category, sentiment, stock, query, sort]);

  const dirty = category !== 'all' || sentiment !== 'all' || stock || query;
  const clear = () => { setCategory('all'); setSentiment('all'); setStock(''); setQuery(''); };

  return (
    <div className="space-y-5">
      <SectionHeader title="Financial news" subtitle="Latest market headlines. Sentiment is estimated from the wording of each story." />

      {/* Filters */}
      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              className="input-field pl-9 pr-9 text-sm h-10"
              placeholder="Search headlines, sources or topics…"
              aria-label="Search news"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"><X size={14} /></button>
            )}
          </div>
          <select aria-label="Sort news" value={sort} onChange={(e) => setSort(e.target.value)} className="input-field h-10 text-sm sm:w-44">
            {SORTS.map((s) => <option key={s.value} value={s.value} className="bg-bg-secondary">{s.label}</option>)}
          </select>
        </div>

        <Chips options={categories} value={category} onChange={setCategory} />

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Chips options={SENTIMENTS} value={sentiment} onChange={setSentiment} />
          {topStocks.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-text-muted">Stock</span>
              {topStocks.map((s) => (
                <button
                  key={s}
                  onClick={() => setStock(stock === s ? '' : s)}
                  aria-pressed={stock === s}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium border transition-colors ${stock === s ? 'bg-accent-primary/15 border-accent-primary/50 text-accent-primary' : 'border-bg-border text-text-secondary hover:text-text-primary hover:border-accent-primary/30'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-text-muted" aria-live="polite">
          <span>{loading ? 'Loading…' : `${items.length} of ${all.length} stories`}</span>
          {dirty && <button onClick={clear} className="text-accent-primary hover:underline">Clear filters</button>}
        </div>
      </Card>

      {error && <ErrorNotice message={`Couldn't load news: ${error}`} onRetry={reload} />}

      {loading ? (
        <div className="space-y-4">{[0, 1, 2].map((i) => <Card key={i}><LoadingSkeleton lines={3} /></Card>)}</div>
      ) : items.length === 0 && !error ? (
        <Card>
          <EmptyState
            icon={Newspaper}
            title={dirty ? 'No stories match these filters' : 'No stories right now'}
            description={dirty ? 'Try a different category or clear the filters.' : 'Check back in a little while.'}
            action={dirty ? <button onClick={clear} className="btn-secondary text-sm py-2">Clear filters</button> : undefined}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((item, i) => {
              const hasScores = typeof item.bullishScore === 'number';
              return (
                <motion.div
                  key={item.id || item.url}
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.35, ease: EASE, delay: Math.min(i, 8) * 0.03 }}
                >
                  <Card hover>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {item.sentiment && <Badge variant={sentimentVariant[item.sentiment] || 'default'} className="capitalize">{item.sentiment}</Badge>}
                          {item.category && <Badge>{item.category}</Badge>}
                          <span className="text-xs text-text-muted">{item.source}{item.time ? ` · ${timeAgo(item.time)}` : ''}</span>
                        </div>
                        {item.url ? (
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="group/link inline-flex items-start gap-1.5 font-semibold text-text-primary mb-2 leading-snug hover:text-accent-primary transition-colors">
                            {item.title}
                            <ArrowUpRight size={15} className="shrink-0 mt-0.5 opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all" />
                          </a>
                        ) : (
                          <h3 className="font-semibold text-text-primary mb-2 leading-snug">{item.title}</h3>
                        )}
                        {item.summary && <p className="text-text-secondary text-sm leading-relaxed line-clamp-3">{item.summary}</p>}
                        {item.relatedStocks?.length > 0 && (
                          <div className="flex items-center gap-2 mt-3 flex-wrap">
                            <span className="text-xs text-text-muted">Related:</span>
                            {item.relatedStocks.map((s, idx) => (
                              <button key={`${s}-${idx}`} onClick={() => setStock(s)} className="hover:opacity-80 transition-opacity"><Badge variant="primary">{s}</Badge></button>
                            ))}
                          </div>
                        )}
                      </div>

                      {hasScores && (
                        <div className="shrink-0 sm:w-28 space-y-1.5">
                          <p className="text-xs text-text-muted">Sentiment</p>
                          {[['Bull', item.bullishScore, 'text-accent-green', 'bg-accent-green'], ['Bear', item.bearishScore, 'text-accent-red', 'bg-accent-red']].map(([l, v, text, bg]) => (
                            <div key={l}>
                              <div className="flex justify-between text-xs">
                                <span className={text}>{l}</span>
                                <span className={`font-mono ${text}`}>{v}%</span>
                              </div>
                              <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${bg}`} style={{ width: `${v}%`, transition: 'width 0.9s cubic-bezier(0.22,1,0.36,1)' }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
