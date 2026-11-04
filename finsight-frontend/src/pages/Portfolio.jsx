// Portfolio.jsx — holdings with live prices

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BriefcaseBusiness, Trash2 } from 'lucide-react';
import { Card, SectionHeader, Badge, EmptyState, ErrorNotice, LoadingSkeleton } from '../components/ui';
import { PortfolioPieChart } from '../components/charts';
import { Stagger, Item, CountUp } from '../components/motion';
import AddHoldingModal from '../components/portfolio/AddHoldingModal';
import useApi from '../lib/useApi';
import { inr } from '../lib/format';
import api from '../services/api';
import { CHART_PALETTE } from '../lib/theme';

const fetchPortfolio = () => api.portfolio.get();

function HoldingRow({ holding, onOpen, onRemove, removing }) {
  const { symbol, name, quantity, averagePrice, sector } = holding;
  const currentPrice = holding.currentPrice ?? averagePrice;
  const invested = quantity * averagePrice;
  const current = quantity * currentPrice;
  const pl = current - invested;
  const plPct = invested ? (pl / invested) * 100 : 0;
  const pos = pl >= 0;
  const tone = pos ? 'text-accent-green' : 'text-accent-red';

  return (
    <tr onClick={onOpen} className="border-b border-bg-border last:border-0 hover:bg-bg-tertiary/50 cursor-pointer transition-colors group">
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-bg-tertiary border border-bg-border flex items-center justify-center text-xs font-bold font-mono text-accent-primary">{symbol[0]}</div>
          <div>
            <p className="text-sm font-semibold text-text-primary group-hover:text-accent-primary transition-colors">{symbol}</p>
            <p className="text-xs text-text-muted">{name}</p>
          </div>
        </div>
      </td>
      <td className="py-3 pr-4"><Badge>{sector}</Badge></td>
      <td className="py-3 pr-4 font-mono text-sm text-text-secondary">{quantity}</td>
      <td className="py-3 pr-4 font-mono text-sm text-text-secondary">{inr(averagePrice, 2)}</td>
      <td className="py-3 pr-4 font-mono text-sm text-text-primary font-semibold">
        {inr(currentPrice, 2)}
        {holding.error && <span title={holding.error} className="ml-1 text-accent-warn">*</span>}
      </td>
      <td className="py-3 pr-4 font-mono text-sm text-text-primary">{inr(current)}</td>
      <td className="py-3 pr-4">
        <p className={`font-mono text-sm font-semibold ${tone}`}>{pos ? '+' : '−'}{inr(Math.abs(pl))}</p>
        <p className={`font-mono text-xs ${tone}`}>{pos ? '+' : ''}{plPct.toFixed(2)}%</p>
      </td>
      <td className="py-3 text-right">
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          disabled={removing}
          aria-label={`Remove ${symbol}`}
          className="p-1.5 rounded-md text-text-muted hover:text-accent-red hover:bg-accent-red/10 transition-colors disabled:opacity-50"
        >
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  );
}

export default function Portfolio() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useApi(fetchPortfolio, { allow404: true });
  const [showAdd, setShowAdd] = useState(false);
  const [removing, setRemoving] = useState('');
  const [actionError, setActionError] = useState('');

  const portfolio = data?.portfolio;
  const holdings = portfolio?.holdings || [];
  const s = portfolio?.summary;
  const totalPL = s?.totalPL || 0;
  const pos = totalPL >= 0;

  const bySector = {};
  holdings.forEach((h) => { bySector[h.sector || 'Other'] = (bySector[h.sector || 'Other'] || 0) + (h.currentValue ?? h.quantity * h.averagePrice); });
  const total = Object.values(bySector).reduce((a, b) => a + b, 0);
  const allocation = Object.entries(bySector)
    .map(([name, v], i) => ({ name, value: Math.round((v / total) * 100), color: CHART_PALETTE[i % CHART_PALETTE.length] }))
    .sort((a, b) => b.value - a.value);

  const remove = async (symbol) => {
    setRemoving(symbol);
    setActionError('');
    try {
      await api.portfolio.removeHolding(symbol);
      reload();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setRemoving('');
    }
  };

  const cards = [
    { l: 'Portfolio value', v: Math.round(s?.totalCurrent || 0), p: '₹' },
    { l: 'Total invested', v: Math.round(s?.totalInvested || 0), p: '₹' },
    { l: 'Total P&L', v: Math.abs(Math.round(totalPL)), p: `${pos ? '+' : '−'}₹`, sub: s ? `${pos ? '+' : ''}${(s.totalPLPercent || 0).toFixed(2)}%` : null, tone: pos ? 'text-accent-green' : 'text-accent-red' },
  ];

  return (
    <Stagger className="space-y-5">
      <Item>
        <SectionHeader
          title="My portfolio"
          subtitle="Holdings and returns at live prices"
          action={
            <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 text-sm py-2">
              <Plus size={15} /> Add holding
            </button>
          }
        />
      </Item>

      {error && <ErrorNotice message={`Couldn't load your portfolio: ${error}`} onRetry={reload} />}
      {actionError && <ErrorNotice message={actionError} />}

      <Item className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map(({ l, v, p, sub, tone }) => (
          <Card key={l} hover>
            <p className="text-text-muted text-sm mb-1">{l}</p>
            <p className={`font-mono font-bold text-xl ${tone || 'text-text-primary'}`}>
              <CountUp value={v} prefix={p} />
              {sub && <span className="text-sm ml-2">({sub})</span>}
            </p>
          </Card>
        ))}
      </Item>

      {loading ? (
        <Card><LoadingSkeleton lines={5} height="h-8" /></Card>
      ) : holdings.length === 0 ? (
        <Item>
          <Card>
            <EmptyState
              icon={BriefcaseBusiness}
              title="No holdings yet"
              description="Add the stocks you own to track their value and profit or loss."
              action={<button onClick={() => setShowAdd(true)} className="btn-primary text-sm py-2">Add your first holding</button>}
            />
          </Card>
        </Item>
      ) : (
        <>
          <Item className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card className="lg:col-span-2">
              <SectionHeader title="Profit and loss by holding" subtitle="Current value vs. amount invested" />
              <div className="space-y-3">
                {holdings.map((h) => {
                  const inv = h.quantity * h.averagePrice;
                  const pl = (h.currentValue ?? inv) - inv;
                  const pctVal = inv ? (pl / inv) * 100 : 0;
                  const width = Math.min(100, Math.abs(pctVal) * 2);
                  return (
                    <div key={h.symbol} className="flex items-center gap-3 text-xs">
                      <span className="w-20 font-mono font-semibold text-text-secondary truncate">{h.symbol}</span>
                      <div className="flex-1 h-2 bg-bg-tertiary rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pl >= 0 ? 'bg-accent-green' : 'bg-accent-red'}`}
                          style={{ width: `${width}%`, transition: 'width 0.9s cubic-bezier(0.22,1,0.36,1)' }}
                        />
                      </div>
                      <span className={`w-16 text-right font-mono ${pl >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>{pl >= 0 ? '+' : ''}{pctVal.toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
            </Card>
            <Card>
              <SectionHeader title="Sector allocation" />
              <PortfolioPieChart data={allocation} />
            </Card>
          </Item>

          <Item>
            <Card>
              <SectionHeader title="Holdings" subtitle={`${holdings.length} ${holdings.length === 1 ? 'stock' : 'stocks'}`} />
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[760px]">
                  <thead>
                    <tr className="border-b border-bg-border text-left">
                      {['Stock', 'Sector', 'Qty', 'Avg price', 'Current', 'Value', 'P&L', ''].map((h, i) => (
                        <th key={i} className="pb-3 pr-4 text-xs text-text-muted font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((h) => (
                      <HoldingRow key={h.symbol} holding={h} onOpen={() => navigate(`/company/${h.symbol}`)} onRemove={() => remove(h.symbol)} removing={removing === h.symbol} />
                    ))}
                  </tbody>
                </table>
              </div>
              {holdings.some((h) => h.error) && <p className="text-xs text-text-muted mt-3">* Live price unavailable; showing your buy price.</p>}
            </Card>
          </Item>
        </>
      )}

      <AddHoldingModal open={showAdd} onClose={() => setShowAdd(false)} onSuccess={reload} />
    </Stagger>
  );
}
