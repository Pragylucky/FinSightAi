// Shared UI building blocks: import { Card, Badge, StatCard } from '../components/ui'

import { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { TrendingUp, TrendingDown, X } from 'lucide-react';
import { COLORS } from '../../lib/theme';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import { CountUp } from '../motion';
import { trackSpotlight, EASE } from '../../lib/motion';

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', hover = false, onClick }) {
  const interactive = typeof onClick === 'function';
  return (
    <div
      onClick={onClick}
      onMouseMove={hover ? trackSpotlight : undefined}
      onKeyDown={interactive ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onClick(e)) : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      className={`bg-bg-secondary/90 border border-bg-border rounded-xl p-4 ${hover ? 'card-hover spotlight cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
const badgeVariants = {
  default: 'bg-bg-tertiary text-text-secondary',
  primary: 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20',
  secondary: 'bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/20',
  green: 'bg-accent-green/10 text-accent-green border border-accent-green/20',
  red: 'bg-accent-red/10 text-accent-red border border-accent-red/20',
  warn: 'bg-accent-warn/10 text-accent-warn border border-accent-warn/20',
  bullish: 'bg-accent-green/10 text-accent-green',
  bearish: 'bg-accent-red/10 text-accent-red',
  neutral: 'bg-accent-warn/10 text-accent-warn',
};

export function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${badgeVariants[variant] || badgeVariants.default} ${className}`}>
      {children}
    </span>
  );
}

// ─── Change Badge ─────────────────────────────────────────────────────────────
export function ChangeBadge({ value, showIcon = true, className = '' }) {
  const isPositive = value >= 0;
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-mono font-semibold ${isPositive ? 'text-accent-green' : 'text-accent-red'} ${className}`}>
      {showIcon && (isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />)}
      {isPositive ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, change, icon: Icon, iconColor = 'text-accent-primary', prefix = '', suffix = '', decimals = 0, hint, className = '' }) {
  const isPositive = change >= 0;
  const hasChange = typeof change === 'number' && Number.isFinite(change);

  return (
    <Card hover className={className}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-text-secondary text-sm font-medium mb-1">{label}</p>
          <p className="text-2xl font-bold text-text-primary font-mono truncate">
            {typeof value === 'number'
              ? <CountUp value={value} decimals={decimals} prefix={prefix} suffix={suffix} />
              : `${prefix}${value}${suffix}`}
          </p>
          {hasChange && (
            <div className="flex items-center gap-1 mt-1">
              {isPositive ? <TrendingUp size={12} className="text-accent-green" /> : <TrendingDown size={12} className="text-accent-red" />}
              <span className={`text-xs font-mono font-semibold ${isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
                {isPositive ? '+' : ''}{change.toFixed(2)}%
              </span>
              {hint && <span className="text-text-muted text-xs">{hint}</span>}
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
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-5">
      <div className="min-w-0">
        <h2 className="text-xl font-display font-bold text-text-primary">{title}</h2>
        {subtitle && <p className="text-text-secondary text-sm mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ─── StockRow ─────────────────────────────────────────────────────────────────
export function StockRow({ symbol, name, price, change, extra, onClick }) {
  const isPositive = change >= 0;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left flex items-center justify-between py-3 px-3 rounded-lg hover:bg-bg-tertiary transition-colors group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-bg-tertiary border border-bg-border flex items-center justify-center group-hover:border-accent-primary/40 transition-colors">
          <span className="text-sm font-bold font-mono text-accent-primary">{symbol?.[0]}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary group-hover:text-accent-primary transition-colors">{symbol}</p>
          <p className="text-xs text-text-muted truncate">{name}</p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-mono font-semibold text-text-primary">
          {typeof price === 'number' ? price.toLocaleString('en-IN') : '—'}
        </p>
        <div className={`text-xs font-mono font-semibold flex items-center gap-0.5 justify-end ${isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
          {typeof change === 'number' ? `${isPositive ? '+' : ''}${change.toFixed(2)}%` : '—'}
          {extra && <span className="text-text-muted ml-1 font-normal">{extra}</span>}
        </div>
      </div>
    </button>
  );
}

// ─── RiskMeter ────────────────────────────────────────────────────────────────
export function RiskMeter({ score }) {
  const color = score < 30 ? COLORS.bull : score < 60 ? COLORS.warn : COLORS.bear;
  const label = score < 30 ? 'Low Risk' : score < 60 ? 'Medium Risk' : 'High Risk';
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-text-secondary">Risk Score</span>
        <span className="font-mono font-bold" style={{ color }}>{score}/100 — {label}</span>
      </div>
      <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.9, ease: EASE }}
        />
      </div>
    </div>
  );
}

// ─── LoadingSkeleton ──────────────────────────────────────────────────────────
export function LoadingSkeleton({ lines = 3, height = 'h-4' }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton ${height} ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
      ))}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-bg-secondary border border-bg-border flex items-center justify-center mb-4 animate-float">
          <Icon size={28} className="text-text-muted" />
        </div>
      )}
      <h3 className="text-text-primary font-semibold text-lg mb-2">{title}</h3>
      {description && <p className="text-text-secondary text-sm max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  );
}

// ─── ErrorNotice ──────────────────────────────────────────────────────────────
export function ErrorNotice({ message, onRetry }) {
  return (
    <div role="alert" className="flex items-center justify-between gap-3 p-3 bg-accent-red/10 border border-accent-red/20 rounded-lg text-sm text-accent-red">
      <span>{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="shrink-0 underline underline-offset-2 hover:no-underline">
          Retry
        </button>
      )}
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
export function Tabs({ tabs, activeTab, onChange }) {
  const id = useId();
  return (
    <div role="tablist" className="inline-flex max-w-full overflow-x-auto items-center gap-1 bg-bg-secondary border border-bg-border rounded-lg p-1">
      {tabs.map((tab) => {
        const active = activeTab === tab.value;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={`relative px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              active ? 'text-bg-primary font-semibold' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {active && (
              <motion.span
                layoutId={`tab-pill-${id}`}
                className="absolute inset-0 rounded-md bg-accent-primary"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Filter chips ─────────────────────────────────────────────────────────────
export function Chips({ options, value, onChange, className = '' }) {
  const id = useId();
  return (
    <div className={`flex gap-2 flex-wrap ${className}`}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={`relative px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors border ${
              active ? 'text-bg-primary border-transparent font-semibold' : 'bg-bg-secondary border-bg-border text-text-secondary hover:text-text-primary hover:border-accent-primary/30'
            }`}
          >
            {active && (
              <motion.span
                layoutId={`chip-${id}`}
                className="absolute inset-0 rounded-full bg-accent-primary"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color = COLORS.primary, label, showValue = true }) {
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
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: EASE }}
        />
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
// Portal-based, closes on Esc / backdrop click, animated.
export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-2xl border border-bg-border bg-bg-secondary shadow-2xl shadow-black/60`}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <div className="flex items-center justify-between p-5 border-b border-bg-border">
              <h2 className="text-lg font-display font-bold text-text-primary">{title}</h2>
              <button onClick={onClose} aria-label="Close" className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
