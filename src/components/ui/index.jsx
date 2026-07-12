// ui/index.jsx
// All small reusable components in one file
// Import what you need: import { Card, Badge, StatCard } from '../ui'

import { TrendingUp, TrendingDown } from 'lucide-react';

// ─── Card ─────────────────────────────────────────────────────────────────────
// Basic container with dark background and border
export function Card({ children, className = '', hover = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-bg-secondary border border-bg-border rounded-xl p-4
        ${hover ? 'card-hover cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
// Small label/tag
export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-bg-tertiary text-text-secondary',
    cyan: 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20',
    purple: 'bg-accent-purple/10 text-accent-purple border border-accent-purple/20',
    green: 'bg-accent-green/10 text-accent-green border border-accent-green/20',
    red: 'bg-accent-red/10 text-accent-red border border-accent-red/20',
    yellow: 'bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/20',
    bullish: 'bg-accent-green/10 text-accent-green',
    bearish: 'bg-accent-red/10 text-accent-red',
    neutral: 'bg-accent-yellow/10 text-accent-yellow',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

// ─── Change Badge ─────────────────────────────────────────────────────────────
// Shows +3.4% or -1.2% with color and icon
export function ChangeBadge({ value, showIcon = true, className = '' }) {
  const isPositive = value >= 0;
  return (
    <span className={`
      inline-flex items-center gap-1 text-sm font-mono font-semibold
      ${isPositive ? 'text-accent-green' : 'text-accent-red'}
      ${className}
    `}>
      {showIcon && (
        isPositive
          ? <TrendingUp size={14} />
          : <TrendingDown size={14} />
      )}
      {isPositive ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
// Card with a label + big number + optional change
export function StatCard({ label, value, change, icon: Icon, iconColor = 'text-accent-cyan', prefix = '', suffix = '', className = '' }) {
  const isPositive = change >= 0;

  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-text-secondary text-sm font-medium mb-1">{label}</p>
          <p className="text-2xl font-display font-bold text-text-primary font-mono">
            {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}{suffix}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              {isPositive ? <TrendingUp size={12} className="text-accent-green" /> : <TrendingDown size={12} className="text-accent-red" />}
              <span className={`text-xs font-mono font-semibold ${isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
                {isPositive ? '+' : ''}{change.toFixed(2)}%
              </span>
              <span className="text-text-muted text-xs">today</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 bg-bg-tertiary rounded-lg ${iconColor}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
// Page/section title with optional subtitle and action button
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h2 className="text-xl font-display font-bold text-text-primary">{title}</h2>
        {subtitle && <p className="text-text-secondary text-sm mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ─── StockRow ─────────────────────────────────────────────────────────────────
// One row in a gainers/losers/watchlist list
export function StockRow({ symbol, name, price, change, extra, onClick }) {
  const isPositive = change >= 0;

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-bg-tertiary cursor-pointer transition-all group"
    >
      <div className="flex items-center gap-3">
        {/* Stock logo placeholder — colored circle with first letter */}
        <div className="w-9 h-9 rounded-lg bg-bg-tertiary border border-bg-border flex items-center justify-center">
          <span className="text-sm font-bold font-mono text-accent-cyan">{symbol[0]}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary group-hover:text-accent-cyan transition-colors">{symbol}</p>
          <p className="text-xs text-text-muted">{name}</p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-sm font-mono font-semibold text-text-primary">{price.toLocaleString('en-IN')}</p>
        <div className={`text-xs font-mono font-semibold flex items-center gap-0.5 justify-end ${isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
          {isPositive ? '+' : ''}{change.toFixed(2)}%
          {extra && <span className="text-text-muted ml-1 font-normal">{extra}</span>}
        </div>
      </div>
    </div>
  );
}

// ─── RiskMeter ────────────────────────────────────────────────────────────────
// Visual risk score bar (0 = low, 100 = high)
export function RiskMeter({ score }) {
  const color = score < 30 ? '#00E676' : score < 60 ? '#FFB800' : '#FF3B5C';
  const label = score < 30 ? 'Low Risk' : score < 60 ? 'Medium Risk' : 'High Risk';

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-text-secondary">Risk Score</span>
        <span className="font-mono font-bold" style={{ color }}>{score}/100 — {label}</span>
      </div>
      <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ─── LoadingSkeleton ──────────────────────────────────────────────────────────
// Placeholder while data loads
export function LoadingSkeleton({ lines = 3, height = 'h-4' }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton ${height} ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
      ))}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
// When there's no data
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-bg-secondary border border-bg-border flex items-center justify-center mb-4">
          <Icon size={28} className="text-text-muted" />
        </div>
      )}
      <h3 className="text-text-primary font-semibold text-lg mb-2">{title}</h3>
      <p className="text-text-secondary text-sm max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
// Horizontal tab switcher
export function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex gap-1 bg-bg-secondary border border-bg-border rounded-lg p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`
            flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all
            ${activeTab === tab.value
              ? 'bg-accent-cyan text-bg-primary font-semibold'
              : 'text-text-secondary hover:text-text-primary'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color = '#00D4FF', label, showValue = true }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1">
      {(label || showValue) && (
        <div className="flex justify-between text-xs text-text-secondary">
          {label && <span>{label}</span>}
          {showValue && <span className="font-mono">{value}%</span>}
        </div>
      )}
      <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
