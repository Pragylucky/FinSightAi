// News.jsx

import { useState } from 'react';
import { Newspaper } from 'lucide-react';
import { Card, SectionHeader, Badge, Chips, EmptyState, ErrorNotice, LoadingSkeleton } from '../components/ui';
import { Stagger, Item } from '../components/motion';
import useApi from '../lib/useApi';
import { timeAgo } from '../lib/format';
import api from '../services/api';

const fetchNews = () => api.news.get();
const sentimentVariant = { bullish: 'green', bearish: 'red', neutral: 'warn' };

export default function News() {
  const [filter, setFilter] = useState('all');
  const { data, loading, error, reload } = useApi(fetchNews);

  const all = data?.news || [];
  // Build the filter chips from categories actually present in the feed
  const categories = ['all', ...new Set(all.map((n) => n.category?.toLowerCase()).filter(Boolean))];
  const items = filter === 'all' ? all : all.filter((n) => n.category?.toLowerCase() === filter);

  return (
    <div className="space-y-5">
      <SectionHeader title="Financial news" subtitle="Latest market headlines, with sentiment estimated from the wording" />

      {categories.length > 2 && <Chips options={categories.map((c) => ({ value: c, label: c }))} value={filter} onChange={setFilter} />}

      {error && <ErrorNotice message={`Couldn't load news: ${error}`} onRetry={reload} />}

      {loading ? (
        <div className="space-y-4">{[0, 1, 2].map((i) => <Card key={i}><LoadingSkeleton lines={3} /></Card>)}</div>
      ) : items.length === 0 && !error ? (
        <Card><EmptyState icon={Newspaper} title="No stories right now" description="Check back in a little while." /></Card>
      ) : (
        <Stagger key={filter} className="space-y-4" stagger={0.05}>
          {items.map((item, i) => {
            const hasScores = typeof item.bullishScore === 'number' && typeof item.bearishScore === 'number';
            return (
              <Item key={item.id || item.url || i}>
                <Card hover>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {item.sentiment && <Badge variant={sentimentVariant[item.sentiment] || 'default'} className="capitalize">{item.sentiment}</Badge>}
                        {item.category && <Badge>{item.category}</Badge>}
                        <span className="text-xs text-text-muted">{item.source}{item.time ? ` · ${timeAgo(item.time)}` : ''}</span>
                      </div>
                      {item.url ? (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="block font-semibold text-text-primary mb-2 leading-snug hover:text-accent-primary transition-colors">{item.title}</a>
                      ) : (
                        <h3 className="font-semibold text-text-primary mb-2 leading-snug">{item.title}</h3>
                      )}
                      {item.summary && <p className="text-text-secondary text-sm leading-relaxed">{item.summary}</p>}
                      {item.relatedStocks?.length > 0 && (
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          <span className="text-xs text-text-muted">Related:</span>
                          {item.relatedStocks.map((s, i) => <Badge key={`${s}-${i}`} variant="primary">{s}</Badge>)}
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
              </Item>
            );
          })}
        </Stagger>
      )}
    </div>
  );
}
