// Funds.jsx — mutual funds

import { useState } from 'react';
import { PiggyBank } from 'lucide-react';
import { Card, SectionHeader, Badge, Chips, EmptyState, ErrorNotice, LoadingSkeleton } from '../components/ui';
import { Stagger, Item } from '../components/motion';
import useApi from '../lib/useApi';
import api from '../services/api';

const fetchFunds = () => api.mutualFunds.get();
const riskColors = { Low: 'green', Moderate: 'primary', 'Moderate High': 'warn', High: 'warn', 'Very High': 'red' };
const SORTS = [
  { value: 'returns5Y', label: '5Y returns' },
  { value: 'returns3Y', label: '3Y returns' },
  { value: 'returns1Y', label: '1Y returns' },
];

// Missing returns sort last instead of producing NaN comparisons
const val = (x) => (typeof x === 'number' ? x : -Infinity);

export default function Funds() {
  const { data, loading, error, reload } = useApi(fetchFunds);
  const [sortBy, setSortBy] = useState('returns5Y');
  const [category, setCategory] = useState('all');

  const funds = data?.funds || [];
  const categories = ['all', ...new Set(funds.map((f) => f.category).filter(Boolean))];
  const list = funds
    .filter((f) => category === 'all' || f.category === category)
    .sort((a, b) => val(b[sortBy]) - val(a[sortBy]));

  return (
    <div className="space-y-5">
      <SectionHeader title="Mutual funds" subtitle="Compare funds by returns, NAV and minimum SIP" />

      <Chips options={categories.map((c) => ({ value: c, label: c }))} value={category} onChange={setCategory} />

      <div className="flex items-center gap-3 text-sm flex-wrap">
        <span className="text-text-muted">Sort by</span>
        <Chips options={SORTS} value={sortBy} onChange={setSortBy} />
      </div>

      {error && <ErrorNotice message={`Couldn't load funds: ${error}`} onRetry={reload} />}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{[0, 1, 2, 3].map((i) => <Card key={i}><LoadingSkeleton lines={4} height="h-6" /></Card>)}</div>
      ) : list.length === 0 && !error ? (
        <Card><EmptyState icon={PiggyBank} title="No funds found" description="Try a different category." /></Card>
      ) : (
        <Stagger key={category + sortBy} className="grid grid-cols-1 lg:grid-cols-2 gap-4" stagger={0.05}>
          {list.map((fund) => (
            <Item key={fund.schemeCode || fund.id || fund.name}>
              <Card hover className="h-full">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {fund.riskLevel && <Badge variant={riskColors[fund.riskLevel] || 'default'}>{fund.riskLevel}</Badge>}
                  {fund.category && <Badge>{fund.category}</Badge>}
                </div>
                <h3 className="font-semibold text-text-primary text-sm leading-snug">{fund.name}</h3>
                <p className="text-xs text-text-muted mt-1 mb-4">{fund.amc}</p>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[['1Y', fund.returns1Y], ['3Y', fund.returns3Y], ['5Y', fund.returns5Y]].map(([period, v]) => (
                    <div key={period} className="bg-bg-tertiary rounded-lg p-3 text-center">
                      <p className="text-xs text-text-muted">{period} return</p>
                      <p className={`font-mono font-bold text-sm mt-1 ${typeof v !== 'number' ? 'text-text-muted' : v >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                        {typeof v === 'number' ? `${v > 0 ? '+' : ''}${v.toFixed(2)}%` : 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-bg-border text-xs">
                  <div>
                    <span className="text-text-muted">Latest NAV</span>
                    <p className="font-mono text-text-primary mt-1">
                      {typeof fund.nav === 'number' ? `₹${fund.nav.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-text-muted">Minimum SIP</span>
                    <p className="font-mono text-accent-primary mt-1">{fund.minSip ? `₹${fund.minSip.toLocaleString('en-IN')}` : 'N/A'}</p>
                  </div>
                </div>
              </Card>
            </Item>
          ))}
        </Stagger>
      )}
    </div>
  );
}
