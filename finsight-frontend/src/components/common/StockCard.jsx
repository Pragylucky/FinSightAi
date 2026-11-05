// StockCard — a compact tile for one stock: price, day change, 52-week position and key ratios.
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, Badge } from '../ui';

export default function StockCard({ stock, onClick }) {
  const { symbol, name, sector, capClass, price, changePercent, pe, roe, high52W, low52W } = stock;
  const up = (changePercent ?? 0) >= 0;
  const range = high52W != null && low52W != null ? high52W - low52W : 0;
  const pos = range > 0 ? Math.min(100, Math.max(0, ((price - low52W) / range) * 100)) : null;

  return (
    <Card hover onClick={onClick} className="glow-border group h-full">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 shrink-0 rounded-lg bg-bg-tertiary border border-bg-border flex items-center justify-center text-sm font-bold font-mono text-accent-primary group-hover:scale-110 group-hover:-rotate-3 transition-transform">{symbol[0]}</div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-text-primary group-hover:text-accent-primary transition-colors">{symbol}</p>
            <p className="text-xs text-text-muted truncate">{name}</p>
          </div>
        </div>
        {capClass && <Badge className="shrink-0">{capClass}</Badge>}
      </div>

      <div className="flex items-end justify-between mb-3">
        <p className="font-mono font-bold text-lg text-text-primary">₹{price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
        <p className={`flex items-center gap-1 text-sm font-mono font-semibold ${up ? 'text-accent-green' : 'text-accent-red'}`}>
          {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {up ? '+' : ''}{(changePercent ?? 0).toFixed(2)}%
        </p>
      </div>

      {pos !== null && (
        <div className="mb-3" title={`52-week range: ₹${low52W.toLocaleString('en-IN')} – ₹${high52W.toLocaleString('en-IN')}`}>
          <div className="relative h-1.5 rounded-full bg-gradient-to-r from-accent-red/50 via-accent-warn/50 to-accent-green/50">
            <span className="absolute top-1/2 w-2.5 h-2.5 rounded-full bg-white border-2 border-bg-primary shadow" style={{ left: `${pos}%`, transform: 'translate(-50%, -50%)' }} />
          </div>
          <div className="flex justify-between text-[10px] text-text-muted mt-1"><span>52W low</span><span>52W high</span></div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-text-muted pt-2 border-t border-bg-border">
        <span>PE <span className="font-mono text-text-secondary">{pe != null ? pe.toFixed(1) : '—'}</span></span>
        <span>ROE <span className="font-mono text-text-secondary">{roe != null ? `${roe.toFixed(1)}%` : '—'}</span></span>
        <span className="truncate ml-2">{sector}</span>
      </div>
    </Card>
  );
}
