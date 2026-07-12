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
import { generateStockChartData } from '../../data/mockData';

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
        <p className="font-mono font-bold text-accent-cyan">
          ₹{payload[0].value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
}

// ─── StockChart ───────────────────────────────────────────────────────────────
export function StockChart({ basePrice = 3800, isPositive = true }) {
  const [activeRange, setActiveRange] = useState('1M');
  const days = timeRanges.find(r => r.label === activeRange)?.days || 30;
  const data = generateStockChartData(basePrice, days);

  const color = isPositive ? '#00E676' : '#FF3B5C';
  const gradientId = `gradient-${isPositive ? 'bull' : 'bear'}`;

  return (
    <div>
      {/* Time range selector */}
      <div className="flex gap-1 mb-4">
        {timeRanges.map(({ label }) => (
          <button
            key={label}
            onClick={() => setActiveRange(label)}
            className={`
              px-3 py-1 rounded-md text-xs font-semibold transition-all
              ${activeRange === label
                ? 'bg-accent-cyan text-bg-primary'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-tertiary'
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>

      {/* The actual chart */}
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          {/* Gradient fill under the line */}
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" vertical={false} />

          {/* X axis — dates */}
          <XAxis
            dataKey="date"
            tick={{ fill: '#4A5568', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            tickLine={false}
            axisLine={false}
            interval={Math.floor(days / 6)}
          />

          {/* Y axis — prices */}
          <YAxis
            tick={{ fill: '#4A5568', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(1)}k`}
            domain={['auto', 'auto']}
          />

          {/* Hover tooltip */}
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#1E2D45', strokeWidth: 1 }} />

          {/* The area fill + line */}
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 4, fill: color, stroke: '#0B0F1A', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── VolumeChart ──────────────────────────────────────────────────────────────
export function VolumeChart({ basePrice = 3800 }) {
  const data = generateStockChartData(basePrice, 30);

  return (
    <ResponsiveContainer width="100%" height={80}>
      <BarChart data={data} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
        <Bar dataKey="volume" fill="#1E2D45" radius={[2, 2, 0, 0]} />
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
                <p className="font-mono text-accent-cyan">{payload[0].value}%</p>
              </div>
            ) : null}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="space-y-2 flex-1">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
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
            <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#4A5568', fontSize: 11, fontFamily: 'JetBrains Mono' }}
          tickLine={false}
          axisLine={false}
          interval={6}
        />
        <YAxis
          tick={{ fill: '#4A5568', fontSize: 11, fontFamily: 'JetBrains Mono' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
          domain={['auto', 'auto']}
        />
        <Tooltip
          content={({ active, payload, label }) => active && payload?.length ? (
            <div className="custom-tooltip text-sm">
              <p className="text-text-muted text-xs mb-1">{label}</p>
              <p className="font-mono font-bold text-accent-cyan">
                ₹{payload[0].value.toLocaleString('en-IN')}
              </p>
            </div>
          ) : null}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#00D4FF"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#00D4FF', stroke: '#0B0F1A', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
