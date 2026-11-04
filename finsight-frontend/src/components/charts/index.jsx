// charts/StockChart.jsx
// Uses Recharts — a React-friendly charting library
// Recharts works by composing chart components like Lego blocks

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { useState } from 'react';
import { COLORS } from '../../lib/theme';

// TIME RANGE BUTTONS — 1W, 1M, 3M, 6M, 1Y
const timeRanges = [
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 },
];

// Custom tooltip component — the popup when you hover over the chart
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip text-sm">
        <p className="text-text-muted text-xs mb-1">{label}</p>
        <p className="font-mono font-bold text-accent-primary">
          ₹{payload[0].value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
}

// ─── StockChart ───────────────────────────────────────────────────────────────
export function StockChart({
  isPositive = true,
  chartData = [],
  onRangeChange,
}) {
  const [activeRange, setActiveRange] = useState('1M');
  const data = chartData;

  const color = isPositive ? COLORS.bull : COLORS.bear;
  const gradientId = `gradient-${isPositive ? 'bull' : 'bear'}`;

  return (
    <div>
      {/* Time range selector */}
      <div className="flex gap-1 mb-4">
        {timeRanges.map(({ label, days }) => (
          <button
            key={label}
           onClick={() => {
                            setActiveRange(label);
                            onRangeChange?.(days);
            }}
            className={`
              px-3 py-1 rounded-md text-xs font-semibold transition-all
              ${activeRange === label
                ? 'bg-accent-primary text-bg-primary'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-tertiary'
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>

      {data.length === 0 ? (
        <div className="h-[280px] flex items-center justify-center text-sm text-text-muted">No price history available.</div>
      ) : (
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          {/* Gradient fill under the line */}
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />

          {/* X axis — dates */}
          <XAxis
            dataKey="date"
            tick={{ fill: COLORS.axis, fontSize: 11, fontFamily: 'JetBrains Mono' }}
            tickLine={false}
            axisLine={false}
            interval={Math.max(0, Math.floor(data.length / 6))}
          />

          {/* Y axis — prices */}
          <YAxis
            tick={{ fill: COLORS.axis, fontSize: 11, fontFamily: 'JetBrains Mono' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            width={56}
            domain={['auto', 'auto']}
          />

          {/* Hover tooltip */}
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: COLORS.grid, strokeWidth: 1 }} />

          {/* The area fill + line */}
          <Area
            type="monotone"
            animationDuration={900}
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 4, fill: color, stroke: COLORS.bg, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      )}
    </div>
  );
}

// ─── VolumeChart ──────────────────────────────────────────────────────────────
export function VolumeChart({ chartData = [] }) {
  const data = chartData;

  return (
    <ResponsiveContainer width="100%" height={80}>
      <BarChart data={data} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
        <Bar dataKey="volume" fill={COLORS.grid} radius={[2, 2, 0, 0]} />
        <XAxis dataKey="date" hide />
        <YAxis hide />
        <Tooltip
          content={({ active, payload }) => active && payload?.length ? (
            <div className="custom-tooltip text-xs">
              <span className="text-text-muted">Vol: </span>
              <span className="font-mono text-text-primary">{(payload[0].value / 1000000).toFixed(2)}M</span>
            </div>
          ) : null}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── PortfolioPieChart ────────────────────────────────────────────────────────
export function PortfolioPieChart({ data }) {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <div className="flex flex-col lg:flex-row items-center gap-4">
      <ResponsiveContainer width={200} height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.color}
                opacity={activeIndex === null || activeIndex === index ? 1 : 0.5}
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => active && payload?.length ? (
              <div className="custom-tooltip text-xs">
                <p className="font-semibold text-text-primary">{payload[0].name}</p>
                <p className="font-mono text-accent-primary">{payload[0].value}%</p>
              </div>
            ) : null}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="space-y-2 flex-1">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-text-secondary">{item.name}</span>
            </div>
            <span className="text-sm font-mono font-semibold text-text-primary">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PortfolioLineChart ───────────────────────────────────────────────────────
export function PortfolioLineChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2} />
            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: COLORS.axis, fontSize: 11, fontFamily: 'JetBrains Mono' }}
          tickLine={false}
          axisLine={false}
          interval={6}
        />
        <YAxis
          tick={{ fill: COLORS.axis, fontSize: 11, fontFamily: 'JetBrains Mono' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
          domain={['auto', 'auto']}
        />
        <Tooltip
          content={({ active, payload, label }) => active && payload?.length ? (
            <div className="custom-tooltip text-sm">
              <p className="text-text-muted text-xs mb-1">{label}</p>
              <p className="font-mono font-bold text-accent-primary">
                ₹{payload[0].value.toLocaleString('en-IN')}
              </p>
            </div>
          ) : null}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={COLORS.primary}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: COLORS.primary, stroke: COLORS.bg, strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
