// Company.jsx


import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Star, StarOff, Share2, Bookmark,
  CheckCircle2, XCircle, Zap, AlertTriangle, ChevronDown, ChevronUp,
  BarChart3, FileText,
} from 'lucide-react';
import { Card, Badge, Tabs, RiskMeter, ChangeBadge, SectionHeader } from '../components/ui';
import { StockChart, VolumeChart } from '../components/charts';
import { companyData, generateStockChartData } from '../data/mockData';
import api from '../services/api';

// A single key financial metric box
function MetricBox({ label, value, highlight = false }) {
  return (
    <div className="bg-bg-tertiary rounded-lg p-3 border border-bg-border">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <p className={`font-mono font-bold text-sm ${highlight ? 'text-accent-cyan' : 'text-text-primary'}`}>
        {value}
      </p>
    </div>
  );
}

// Expandable pros/cons list item
function ProsConsItem({ text, type }) {
  const isPos = type === 'pro';
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg ${isPos ? 'bg-accent-green/5 border border-accent-green/15' : 'bg-accent-red/5 border border-accent-red/15'}`}>
      {isPos
        ? <CheckCircle2 size={15} className="text-accent-green mt-0.5 shrink-0" />
        : <XCircle size={15} className="text-accent-red mt-0.5 shrink-0" />
      }
      <p className="text-sm text-text-secondary leading-relaxed">{text}</p>
    </div>
  );
}

// Quarterly results mock
const quarterlyResults = [
  { q: 'Q3 FY25', rev: '63,092', revG: '+8.7%', np: '12,380', npG: '+11.2%', margin: '24.5%' },
  { q: 'Q2 FY25', rev: '59,692', revG: '+8.9%', np: '11,909', npG: '+10.8%', margin: '24.2%' },
  { q: 'Q1 FY25', rev: '59,380', revG: '+9.1%', np: '11,724', npG: '+9.7%', margin: '23.9%' },
  { q: 'Q4 FY24', rev: '61,237', revG: '+6.8%', np: '12,434', npG: '+6.4%', margin: '24.0%' },
];

export default function Company() {
  // useParams gets the :symbol from the URL
  const { symbol = 'TCS' } = useParams();
  const navigate = useNavigate();
  
  const [tab, setTab] = useState('overview');
  const [realCompany, setRealCompany] = useState(null);
  const [apiError, setApiError] = useState('');
  const [chartData, setChartData] = useState([]);
  const realQuarterlyResults = (
  realCompany?.company?.quarterlyResults || []
).map((item, index, arr) => {
  const previous = arr[index + 1];

  const revenueGrowth =
    previous?.revenue && item.revenue
      ? ((item.revenue - previous.revenue) / previous.revenue) * 100
      : null;

  const profitGrowth =
    previous?.netIncome && item.netIncome
      ? ((item.netIncome - previous.netIncome) / previous.netIncome) * 100
      : null;

  return {
    ...item,
    revenueGrowth,
    profitGrowth,
  };
});
  useEffect(() => {
  const fetchCompany = async () => {
    try {
      setApiError('');

      const [companyDataResponse, chartDataResponse] = await Promise.all([
        api.company.get(symbol.toUpperCase()),
        api.company.getChart(symbol.toUpperCase(), 30),
      ]);

      console.log(
        'REAL COMPANY DATA:',
        JSON.stringify(companyDataResponse, null, 2)
      );
      console.log(
        '🔥 QUARTERLY RESULTS:',
        companyDataResponse?.company?.quarterlyResults
      );
      console.log(
        '🔥 FIRST QUARTER:',
        companyDataResponse?.company?.quarterlyResults?.[0]
      );

      console.log(
        'REAL CHART DATA:',
        JSON.stringify(chartDataResponse, null, 2)
      );
      console.log(
        '📰 RAW COMPANY NEWS:',
        companyDataResponse?.company?.news
      );

      setRealCompany(companyDataResponse);
      setChartData(chartDataResponse.data || []);
    } catch (err) {
      console.error('COMPANY API ERROR:', err);
      setApiError(err.message);
    }
  };

  fetchCompany();
}, [symbol]);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [showFullSummary, setShowFullSummary] = useState(false);

  // Get company data — if symbol not in our mock, show TCS
  // Mock data is kept temporarily as fallback for fields
// that the backend does not provide yet
const mockCompany =
  companyData[symbol.toUpperCase()] || companyData['TCS'];

const realData = realCompany?.company;
const quote = realData?.quote;

// Merge REAL backend data with existing mock data
const company = {
  ...mockCompany,

  // Real company identity/profile when available
  symbol: realData?.symbol || mockCompany.symbol,
  name: realData?.name || mockCompany.name,
  sector: realData?.sector || mockCompany.sector,

  // REAL Yahoo Finance quote
  price: quote?.price ?? mockCompany.price,
  changeAmt: quote?.change ?? mockCompany.changeAmt,
  change: quote?.changePercent ?? mockCompany.change,

  open: quote?.open ?? mockCompany.open,
  high: quote?.high ?? mockCompany.high,
  low: quote?.low ?? mockCompany.low,
  prevClose: quote?.prevClose ?? mockCompany.prevClose,

  // Profile metrics — real when backend provides them
  marketCap: realData?.marketCap || mockCompany.marketCap,
  pe: realData?.pe ?? mockCompany.pe,
  pb: realData?.pb ?? mockCompany.pb,
  eps: realData?.eps ?? mockCompany.eps,
  roe: realData?.roe ?? mockCompany.roe,
  dividendYield: realData?.dividendYield ?? mockCompany.dividendYield,
  debtToEquity: realData?.debtToEquity ?? mockCompany.debtToEquity,
  week52High:
    realData?.week52High || mockCompany.week52High,
  week52Low:
    realData?.week52Low || mockCompany.week52Low,

 
  // Real company news from backend
  news: realData?.news || [],
 // AI analysis — real when available
  aiSummary:
    realData?.aiAnalysis?.summary || mockCompany.aiSummary,
};

const isPositive = company.change >= 0;

  const tabs = [
    { label: 'Overview', value: 'overview' },
    { label: 'Financials', value: 'financials' },
    { label: 'AI Analysis', value: 'ai' },
    { label: 'News', value: 'news' },
  ];

  return (
    <div className="space-y-5 page-enter">
      {/* ── STOCK HEADER ──────────────────────────────────────────────── */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          {/* Left: Name + price */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              {/* Symbol badge */}
              <div className="w-10 h-10 rounded-lg bg-bg-tertiary border border-bg-border flex items-center justify-center">
                <span className="font-mono font-bold text-accent-cyan">{company.symbol[0]}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display font-bold text-xl text-text-primary">{company.symbol}</h1>
                  <Badge variant="cyan">{company.sector}</Badge>
                </div>
                <p className="text-text-secondary text-sm">{company.name}</p>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 mt-3">
              <span className="font-mono font-bold text-3xl text-text-primary">
                ₹{company.price.toLocaleString('en-IN')}
              </span>
              <div className={`flex items-center gap-1 pb-1 font-mono font-semibold ${isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
                {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {isPositive ? '+' : ''}₹{company.changeAmt.toFixed(2)} ({isPositive ? '+' : ''}{company.change.toFixed(2)}%)
              </div>
            </div>
            <p className="text-text-muted text-xs mt-1">NSE · Last updated just now · Market open</p>
          </div>

          {/* Right: Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setInWatchlist(!inWatchlist)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                inWatchlist
                  ? 'bg-accent-yellow/10 border-accent-yellow/30 text-accent-yellow'
                  : 'border-bg-border text-text-secondary hover:border-accent-yellow/30 hover:text-accent-yellow'
              }`}
            >
              {inWatchlist ? <Star size={15} fill="currentColor" /> : <StarOff size={15} />}
              {inWatchlist ? 'Watching' : 'Watchlist'}
            </button>
            <button className="p-2 border border-bg-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all">
              <Share2 size={16} />
            </button>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mt-5 pt-4 border-t border-bg-border text-xs">
          {[
            ['Open', `₹${company.open.toLocaleString()}`],
            ['High', `₹${company.high.toLocaleString()}`],
            ['Low', `₹${company.low.toLocaleString()}`],
            ['Prev Close', `₹${company.prevClose.toLocaleString()}`],
            ['Volume', company.volume],
            ['Avg Vol', company.avgVolume],
            ['52W High', `₹${company.week52High.toLocaleString()}`],
            ['52W Low', `₹${company.week52Low.toLocaleString()}`],
          ].map(([l, v]) => (
            <div key={l}>
              <p className="text-text-muted">{l}</p>
              <p className="font-mono font-semibold text-text-primary mt-0.5">{v}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* ── TABS ──────────────────────────────────────────────────────── */}
      <Tabs tabs={tabs} activeTab={tab} onChange={setTab} />

      {/* ── OVERVIEW TAB ──────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="space-y-5">
          {/* Chart */}
          <Card>
            <SectionHeader title="Price Chart" subtitle={company.symbol + ' · NSE'} />
            <StockChart
              basePrice={company.price}
              isPositive={isPositive}
              chartData={chartData}
            />
            <div className="mt-3 border-t border-bg-border pt-3">
              <p className="text-xs text-text-muted mb-1">Volume</p>
              <VolumeChart
                basePrice={company.price}
                chartData={chartData}
              />
            </div>
          </Card>

          {/* Key Metrics */}
          <Card>
            <SectionHeader title="Key Metrics" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <MetricBox label="Market Cap" value={company.marketCap} highlight />
              <MetricBox label="PE Ratio" value={company.pe} />
              <MetricBox label="PB Ratio" value={company.pb} />
              <MetricBox label="EPS (TTM)" value={`₹${company.eps}`} />
              <MetricBox label="Dividend Yield" value={`${company.dividendYield}%`} />
              <MetricBox label="ROE" value={`${company.roe}%`} highlight />
              <MetricBox label="Debt/Equity" value={company.debtToEquity} />
              <MetricBox label="Revenue" value={company.revenue} />
            </div>
          </Card>

          {/* 52-Week Range */}
          <Card>
            <SectionHeader title="52-Week Range" />
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-text-secondary">
                <span className="font-mono text-accent-red">₹{company.week52Low.toLocaleString()}</span>
                <span className="font-mono text-accent-green">₹{company.week52High.toLocaleString()}</span>
              </div>
              {/* Range bar with current price indicator */}
              <div className="relative h-3 bg-bg-tertiary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent-red via-accent-yellow to-accent-green"
                  style={{ width: '100%' }}
                />
                {/* Current price pointer */}
                <div
                  className="absolute top-0 w-3 h-3 rounded-full bg-white border-2 border-bg-primary shadow-md"
                  style={{
                    left: `${((company.price - company.week52Low) / (company.week52High - company.week52Low)) * 100}%`,
                    transform: 'translateX(-50%)',
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-text-muted">
                <span>52W Low</span>
                <span className="font-mono text-text-primary font-semibold">Current: ₹{company.price.toLocaleString()}</span>
                <span>52W High</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── FINANCIALS TAB ────────────────────────────────────────────── */}
      {tab === 'financials' && (
        <div className="space-y-5">
          {/* Revenue & Profit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <p className="text-text-muted text-sm mb-1">Total Revenue</p>
              <p className="font-mono font-bold text-2xl text-text-primary">{realQuarterlyResults?.[0]?.revenue
            ? `₹${(realQuarterlyResults[0].revenue / 10000000).toLocaleString('en-IN', {
                maximumFractionDigits: 0,
              })} Cr`
              : '—'}
            </p>
              
            </Card>
            <Card>
              <p className="text-text-muted text-sm mb-1">Net Profit</p>
              <p className="font-mono font-bold text-2xl text-text-primary">{realQuarterlyResults?.[0]?.netIncome
                  ? `₹${(realQuarterlyResults[0].netIncome / 10000000).toLocaleString('en-IN', {
                      maximumFractionDigits: 0,
                    })} Cr`
                  : '—'}
              </p>

            </Card>
          </div>

          {/* Quarterly Results Table */}
          <Card>
            <SectionHeader title="Quarterly Results" subtitle="Revenue & Profit (Rs Crores)" />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-bg-border text-left">
                  <th className="pb-3 px-2 text-text-muted text-xs font-medium">
                    Quarter
                  </th>
                  <th className="pb-3 px-2 text-text-muted text-xs font-medium">
                    Revenue
                  </th>
                  <th className="pb-3 px-2 text-text-muted text-xs font-medium">
                    Rev Growth
                  </th>
                  <th className="pb-3 px-2 text-text-muted text-xs font-medium">
                    Net Profit
                  </th>
                  <th className="pb-3 px-2 text-text-muted text-xs font-medium">
                    Profit Growth
                  </th>
                  <th className="pb-3 px-2 text-text-muted text-xs font-medium">
                    Margin
                  </th>
                </tr>
              </thead>

              <tbody>
                {realQuarterlyResults.map((r, i) => (
                  <tr
                    key={i}
                    className="border-b border-bg-border last:border-0"
                  >
                    {/* Quarter */}
                    <td className="py-3 px-2 font-medium text-text-primary font-mono text-xs">
                      {new Date(r.date).toLocaleDateString('en-IN', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Revenue */}
                    <td className="py-3 px-2 font-mono text-xs text-text-primary">
                      {(r.revenue / 10000000).toLocaleString('en-IN', {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td className="py-3 px-2 font-mono text-xs text-text-primary">
                      {r.netIncome
                        ? (r.netIncome / 10000000).toLocaleString('en-IN', {
                            maximumFractionDigits: 0,
                          })
                        : '—'}
                    </td>
                    <td className="py-3 px-2 font-mono text-xs text-accent-cyan">
                      {r.revenue && r.operatingIncome
                        ? `${((r.operatingIncome / r.revenue) * 100).toFixed(1)}%`
                        : '—'}
                    </td>

                    {/* Revenue Growth */}
                    <td
                      className={`py-3 px-2 font-mono text-xs ${
                        r.revenueGrowth == null
                          ? 'text-text-muted'
                          : r.revenueGrowth >= 0
                            ? 'text-accent-green'
                            : 'text-accent-red'
                      }`}
                    >
                      {r.revenueGrowth == null
                        ? '—'
                        : `${r.revenueGrowth >= 0 ? '+' : ''}${r.revenueGrowth.toFixed(1)}%`}
                    </td>

                    {/* Net Profit */}
                    <td className="py-3 px-2 font-mono text-xs text-text-primary">
                      {(r.netIncome / 10000000).toLocaleString('en-IN', {
                        maximumFractionDigits: 0,
                      })}
                    </td>

                    {/* Profit Growth */}
                    <td
                      className={`py-3 px-2 font-mono text-xs ${
                        r.profitGrowth === null
                          ? 'text-text-muted'
                          : r.profitGrowth >= 0
                            ? 'text-accent-green'
                            : 'text-accent-red'
                      }`}
                    >
                      {r.profitGrowth === null
                        ? '—'
                        : `${r.profitGrowth >= 0 ? '+' : ''}${r.profitGrowth.toFixed(1)}%`}
                    </td>

                    {/* Operating Margin */}
                    <td className="py-3 px-2 font-mono text-xs text-accent-cyan">
                      {r.revenue
                        ? `${((r.operatingIncome / r.revenue) * 100).toFixed(1)}%`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </Card>

          {/* More metrics */}
          <Card>
            <SectionHeader title="Valuation & Efficiency" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <MetricBox
              label="PE Ratio"
              value={company.pe ? Number(company.pe).toFixed(2) : '—'}
              highlight
            />
             <MetricBox
                label="PB Ratio"
                value={company.pb ? Number(company.pb).toFixed(2) : '—'}
              />
              <MetricBox label="ROE" value={`${company.roe}%`} highlight />
              <MetricBox label="Debt/Equity" value={company.debtToEquity} />
              <MetricBox label="EPS" value={`₹${company.eps}`} />
              <MetricBox label="Div. Yield" value={`${company.dividendYield}%`} />
            </div>
          </Card>
        </div>
      )}

      {/* ── AI ANALYSIS TAB ───────────────────────────────────────────── */}
      {tab === 'ai' && (
        <div className="space-y-5">
          {/* AI Summary */}
          <Card className="border-accent-purple/20 bg-gradient-to-br from-accent-purple/5 to-transparent">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent-purple/20 flex items-center justify-center">
                <Zap size={16} className="text-accent-purple" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-text-primary">AI Investment Summary</h3>
                <p className="text-text-muted text-xs">Powered by FinSight AI · Updated today</p>
              </div>
              <Badge variant="purple" className="ml-auto">AI Generated</Badge>
            </div>

            <p className={`text-text-secondary text-sm leading-relaxed ${!showFullSummary ? 'line-clamp-4' : ''}`}>
              {company.aiSummary}
            </p>
            <button
              onClick={() => setShowFullSummary(!showFullSummary)}
              className="flex items-center gap-1 text-xs text-accent-cyan mt-2 hover:underline"
            >
              {showFullSummary ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Read full analysis</>}
            </button>
          </Card>

          {/* Investment Outlook */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <p className="text-text-muted text-sm mb-2">Investment Outlook</p>
              <Badge variant={company.investmentOutlook === 'Positive' ? 'green' : company.investmentOutlook === 'Neutral' ? 'yellow' : 'red'} className="text-base px-4 py-1.5">
                {company.investmentOutlook}
              </Badge>
            </Card>
            <Card>
              <RiskMeter score={company.riskScore} />
            </Card>
          </div>

          {/* Pros */}
          <Card>
            <SectionHeader title="Strengths" subtitle="Why analysts are bullish" />
            <div className="space-y-2">
              {company.pros.map((p, i) => (
                <ProsConsItem key={i} text={p} type="pro" />
              ))}
            </div>
          </Card>

          {/* Cons */}
          <Card>
            <SectionHeader title="Risks & Concerns" subtitle="What to watch out for" />
            <div className="space-y-2">
              {company.cons.map((c, i) => (
                <ProsConsItem key={i} text={c} type="con" />
              ))}
            </div>
          </Card>

          {/* Disclaimer */}
          <div className="flex items-start gap-2 p-3 bg-accent-yellow/5 border border-accent-yellow/20 rounded-lg">
            <AlertTriangle size={15} className="text-accent-yellow shrink-0 mt-0.5" />
            <p className="text-xs text-text-muted leading-relaxed">
              This analysis is generated by AI using public financial data. It&apos;s for educational purposes only and is not financial advice. Always do your own research before investing.
            </p>
          </div>
        </div>
      )}

      {/* ── NEWS TAB ──────────────────────────────────────────────────── */}
      {tab === 'news' && (
        <Card>
          <SectionHeader title={`${company.symbol} News`} subtitle="Latest updates from the market" />
          <div className="space-y-4">
            {company.news.map((n, i) => (
              <div key={i} className="flex items-start gap-3 py-3 border-b border-bg-border last:border-0">
               <Badge
                variant="cyan"
                className="mt-0.5 shrink-0"
              >
                News
              </Badge>
                <div>
                  <a
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-text-primary hover:text-accent-cyan cursor-pointer transition-colors"
                  >
                    {n.title}
                  </a>
                  <p className="text-xs text-text-muted mt-1">
                    {n.source} ·{' '}
                    {new Date(n.time).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
  const handleRangeChange = async (days) => {
  try {
    const response = await api.company.getChart(
      symbol.toUpperCase(),
      days
    );

    setChartData(response.data || []);
  } catch (error) {
    console.error('Failed to load chart range:', error);
  }
};
}
