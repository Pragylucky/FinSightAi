// ================================================================
// REPLACE your entire src/pages/Company.jsx with this file
// Changes: fetches real stock data from backend (Finnhub API)
//          Falls back to mock data if backend not connected
// ================================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Star, StarOff, Share2,
  CheckCircle2, XCircle, Zap, AlertTriangle, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Card, Badge, Tabs, RiskMeter, SectionHeader } from '../components/ui';
import { StockChart, VolumeChart } from '../components/charts';
import api from '../services/api';
import { companyData } from '../data/mockData';  // fallback

function MetricBox({ label, value, highlight = false }) {
  return (
    <div className="bg-bg-tertiary rounded-lg p-3 border border-bg-border">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <p className={`font-mono font-bold text-sm ${highlight ? 'text-accent-cyan' : 'text-text-primary'}`}>
        {value ?? '—'}
      </p>
    </div>
  );
}

function ProsConsItem({ text, type }) {
  const isPos = type === 'pro';
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg ${isPos ? 'bg-accent-green/5 border border-accent-green/15' : 'bg-accent-red/5 border border-accent-red/15'}`}>
      {isPos
        ? <CheckCircle2 size={15} className="text-accent-green mt-0.5 shrink-0" />
        : <XCircle size={15} className="text-accent-red mt-0.5 shrink-0" />}
      <p className="text-sm text-text-secondary leading-relaxed">{text}</p>
    </div>
  );
}

const quarterlyResults = [
  { q: 'Q3 FY25', rev: '63,092', revG: '+8.7%', np: '12,380', npG: '+11.2%', margin: '24.5%' },
  { q: 'Q2 FY25', rev: '59,692', revG: '+8.9%', np: '11,909', npG: '+10.8%', margin: '24.2%' },
  { q: 'Q1 FY25', rev: '59,380', revG: '+9.1%', np: '11,724', npG: '+9.7%', margin: '23.9%' },
  { q: 'Q4 FY24', rev: '61,237', revG: '+6.8%', np: '12,434', npG: '+6.4%', margin: '24.0%' },
];

export default function Company() {
  const { symbol = 'TCS' } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [inWatchlist, setInWatchlist] = useState(false);
  const [showFullSummary, setShowFullSummary] = useState(false);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [companyNews, setCompanyNews] = useState([]);

  const upperSymbol = symbol.toUpperCase();

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      try {
        // ← REAL: GET /api/companies/:symbol
        const data = await api.company.get(upperSymbol);
        // Merge real API data with any extra mock fields for display
        const mock = companyData[upperSymbol] || companyData['TCS'];
        setCompany({
          ...mock,                           // fallback fields (pros, cons etc.)
          ...data.company,                   // override with real data
          symbol: upperSymbol,
          price: data.company.quote?.price || mock.price,
          change: data.company.quote?.changePercent || mock.change,
          changeAmt: data.company.quote?.change || mock.changeAmt,
          high: data.company.quote?.high || mock.high,
          low: data.company.quote?.low || mock.low,
          open: data.company.quote?.open || mock.open,
          prevClose: data.company.quote?.prevClose || mock.prevClose,
          pe: data.company.pe || mock.pe,
          pb: data.company.pb || mock.pb,
          roe: data.company.roe || mock.roe,
          dividendYield: data.company.dividendYield || mock.dividendYield,
          marketCap: data.company.marketCap || mock.marketCap,
          // AI analysis from backend
          aiSummary: data.company.aiAnalysis?.summary || mock.aiSummary,
          pros: data.company.aiAnalysis?.pros || mock.pros,
          cons: data.company.aiAnalysis?.cons || mock.cons,
          riskScore: data.company.aiAnalysis?.riskScore || mock.riskScore,
          investmentOutlook: data.company.aiAnalysis?.outlook || mock.investmentOutlook,
        });
        if (data.company.news?.length) setCompanyNews(data.company.news);
      } catch {
        // Backend unavailable — use mock
        setCompany(companyData[upperSymbol] || companyData['TCS']);
      } finally {
        setLoading(false);
      }

      // Fetch chart data separately
      try {
        const chartRes = await api.company.getChart(upperSymbol, 30); // ← REAL: GET /api/companies/:symbol/chart
        setChartData(chartRes.data);
      } catch { /* use generated mock in StockChart */ }
    };

    fetchCompany();
  }, [upperSymbol]);

  const toggleWatchlist = async () => {
    if (!inWatchlist) {
      try {
        await api.watchlist.add({                // ← REAL: POST /api/watchlist
          symbol: upperSymbol,
          name: company?.name || upperSymbol,
        });
        setInWatchlist(true);
      } catch (e) {
        console.error('Watchlist add failed:', e.message);
        setInWatchlist(!inWatchlist); // still toggle UI for demo
      }
    } else {
      try {
        await api.watchlist.remove(upperSymbol); // ← REAL: DELETE /api/watchlist/:symbol
        setInWatchlist(false);
      } catch {
        setInWatchlist(!inWatchlist);
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-5">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-bg-secondary border border-bg-border rounded-xl p-6">
            <div className="skeleton h-6 w-48 mb-3" />
            <div className="skeleton h-10 w-32 mb-2" />
            <div className="skeleton h-4 w-64" />
          </div>
        ))}
      </div>
    );
  }

  if (!company) return <div className="text-text-secondary p-8 text-center">Company not found</div>;

  const isPositive = company.change >= 0;

  const tabs = [
    { label: 'Overview', value: 'overview' },
    { label: 'Financials', value: 'financials' },
    { label: 'AI Analysis', value: 'ai' },
    { label: 'News', value: 'news' },
  ];

  return (
    <div className="space-y-5 page-enter">
      {/* Stock header */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
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
            <div className="flex items-end gap-3 mt-3">
              <span className="font-mono font-bold text-3xl text-text-primary">
                ₹{Number(company.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <div className={`flex items-center gap-1 pb-1 font-mono font-semibold ${isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
                {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {isPositive ? '+' : ''}{Number(company.changeAmt || 0).toFixed(2)} ({isPositive ? '+' : ''}{Number(company.change || 0).toFixed(2)}%)
              </div>
            </div>
            <p className="text-text-muted text-xs mt-1">NSE · Real-time data</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={toggleWatchlist}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                inWatchlist
                  ? 'bg-accent-yellow/10 border-accent-yellow/30 text-accent-yellow'
                  : 'border-bg-border text-text-secondary hover:border-accent-yellow/30 hover:text-accent-yellow'
              }`}>
              {inWatchlist ? <Star size={15} fill="currentColor" /> : <StarOff size={15} />}
              {inWatchlist ? 'Watching' : 'Watchlist'}
            </button>
            <button className="p-2 border border-bg-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all">
              <Share2 size={16} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mt-5 pt-4 border-t border-bg-border text-xs">
          {[
            ['Open', `₹${Number(company.open || 0).toLocaleString()}`],
            ['High', `₹${Number(company.high || 0).toLocaleString()}`],
            ['Low', `₹${Number(company.low || 0).toLocaleString()}`],
            ['Prev Close', `₹${Number(company.prevClose || 0).toLocaleString()}`],
            ['Volume', company.volume || '—'],
            ['Avg Vol', company.avgVolume || '—'],
            ['52W High', `₹${Number(company.week52High || 0).toLocaleString()}`],
            ['52W Low', `₹${Number(company.week52Low || 0).toLocaleString()}`],
          ].map(([l, v]) => (
            <div key={l}>
              <p className="text-text-muted">{l}</p>
              <p className="font-mono font-semibold text-text-primary mt-0.5">{v}</p>
            </div>
          ))}
        </div>
      </Card>

      <Tabs tabs={tabs} activeTab={tab} onChange={setTab} />

      {/* Overview tab */}
      {tab === 'overview' && (
        <div className="space-y-5">
          <Card>
            <SectionHeader title="Price Chart" subtitle={`${company.symbol} · NSE`} />
            {/* StockChart uses API data if provided, else generates mock */}
            <StockChart basePrice={company.price} isPositive={isPositive} externalData={chartData} />
          </Card>
          <Card>
            <SectionHeader title="Key Metrics" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <MetricBox label="Market Cap" value={company.marketCap} highlight />
              <MetricBox label="PE Ratio" value={company.pe} />
              <MetricBox label="PB Ratio" value={company.pb} />
              <MetricBox label="EPS (TTM)" value={company.eps ? `₹${company.eps}` : '—'} />
              <MetricBox label="Dividend Yield" value={company.dividendYield ? `${company.dividendYield}%` : '—'} />
              <MetricBox label="ROE" value={company.roe ? `${Number(company.roe).toFixed(1)}%` : '—'} highlight />
              <MetricBox label="Debt/Equity" value={company.debtToEquity ?? company.debtEq ?? '—'} />
              <MetricBox label="Net Margin" value={company.netMargin ? `${Number(company.netMargin).toFixed(1)}%` : '—'} />
            </div>
          </Card>
          {(company.week52High && company.week52Low) && (
            <Card>
              <SectionHeader title="52-Week Range" />
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-text-secondary">
                  <span className="font-mono text-accent-red">₹{Number(company.week52Low).toLocaleString()}</span>
                  <span className="font-mono text-accent-green">₹{Number(company.week52High).toLocaleString()}</span>
                </div>
                <div className="relative h-3 bg-bg-tertiary rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-accent-red via-accent-yellow to-accent-green" style={{ width: '100%' }} />
                  <div className="absolute top-0 w-3 h-3 rounded-full bg-white border-2 border-bg-primary shadow-md"
                    style={{
                      left: `${((company.price - company.week52Low) / (company.week52High - company.week52Low)) * 100}%`,
                      transform: 'translateX(-50%)',
                    }} />
                </div>
                <div className="flex justify-between text-xs text-text-muted">
                  <span>52W Low</span>
                  <span className="font-mono text-text-primary font-semibold">Current: ₹{Number(company.price).toLocaleString()}</span>
                  <span>52W High</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Financials tab */}
      {tab === 'financials' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <p className="text-text-muted text-sm mb-1">Total Revenue</p>
              <p className="font-mono font-bold text-2xl text-text-primary">{company.revenue || '—'}</p>
              {company.revenueGrowth && (
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp size={13} className="text-accent-green" />
                  <span className="text-xs font-mono text-accent-green font-semibold">+{company.revenueGrowth}% YoY</span>
                </div>
              )}
            </Card>
            <Card>
              <p className="text-text-muted text-sm mb-1">Net Profit</p>
              <p className="font-mono font-bold text-2xl text-text-primary">{company.netProfit || '—'}</p>
              {company.profitGrowth && (
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp size={13} className="text-accent-green" />
                  <span className="text-xs font-mono text-accent-green font-semibold">+{company.profitGrowth}% YoY</span>
                </div>
              )}
            </Card>
          </div>
          <Card>
            <SectionHeader title="Quarterly Results" subtitle="Revenue & Profit (Rs Crores)" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-bg-border text-left">
                    {['Quarter', 'Revenue', '% Growth', 'Net Profit', '% Growth', 'Margin'].map(h => (
                      <th key={h} className="pb-3 pr-4 text-xs text-text-muted font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {quarterlyResults.map((r, i) => (
                    <tr key={i} className="border-b border-bg-border last:border-0">
                      <td className="py-3 pr-4 font-medium text-text-primary font-mono text-xs">{r.q}</td>
                      <td className="py-3 pr-4 font-mono text-xs text-text-primary">{r.rev}</td>
                      <td className="py-3 pr-4 font-mono text-xs text-accent-green">{r.revG}</td>
                      <td className="py-3 pr-4 font-mono text-xs text-text-primary">{r.np}</td>
                      <td className="py-3 pr-4 font-mono text-xs text-accent-green">{r.npG}</td>
                      <td className="py-3 font-mono text-xs text-accent-cyan">{r.margin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* AI Analysis tab */}
      {tab === 'ai' && (
        <div className="space-y-5">
          <Card className="border-accent-purple/20 bg-gradient-to-br from-accent-purple/5 to-transparent">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent-purple/20 flex items-center justify-center">
                <Zap size={16} className="text-accent-purple" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-text-primary">AI Investment Summary</h3>
                <p className="text-text-muted text-xs">Powered by Claude AI · Updated today</p>
              </div>
              <Badge variant="purple" className="ml-auto">AI Generated</Badge>
            </div>
            <p className={`text-text-secondary text-sm leading-relaxed ${!showFullSummary ? 'line-clamp-4' : ''}`}>
              {company.aiSummary}
            </p>
            <button onClick={() => setShowFullSummary(!showFullSummary)}
              className="flex items-center gap-1 text-xs text-accent-cyan mt-2 hover:underline">
              {showFullSummary ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Read full analysis</>}
            </button>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <p className="text-text-muted text-sm mb-2">Investment Outlook</p>
              <Badge variant={company.investmentOutlook === 'Positive' ? 'green' : company.investmentOutlook === 'Neutral' ? 'yellow' : 'red'}
                className="text-base px-4 py-1.5">
                {company.investmentOutlook || 'Neutral'}
              </Badge>
            </Card>
            <Card><RiskMeter score={company.riskScore || 50} /></Card>
          </div>

          {company.pros?.length > 0 && (
            <Card>
              <SectionHeader title="Strengths" subtitle="Why analysts are bullish" />
              <div className="space-y-2">
                {company.pros.map((p, i) => <ProsConsItem key={i} text={p} type="pro" />)}
              </div>
            </Card>
          )}
          {company.cons?.length > 0 && (
            <Card>
              <SectionHeader title="Risks & Concerns" subtitle="What to watch out for" />
              <div className="space-y-2">
                {company.cons.map((c, i) => <ProsConsItem key={i} text={c} type="con" />)}
              </div>
            </Card>
          )}

          <div className="flex items-start gap-2 p-3 bg-accent-yellow/5 border border-accent-yellow/20 rounded-lg">
            <AlertTriangle size={15} className="text-accent-yellow shrink-0 mt-0.5" />
            <p className="text-xs text-text-muted leading-relaxed">
              This analysis is generated by AI using public financial data. Educational purposes only — not financial advice.
            </p>
          </div>
        </div>
      )}

      {/* News tab */}
      {tab === 'news' && (
        <Card>
          <SectionHeader title={`${company.symbol} News`} subtitle="Latest updates" />
          <div className="space-y-4">
            {(companyNews.length ? companyNews : [
              { title: `${company.symbol} Q3 Results Beat Analyst Estimates`, source: 'Economic Times', time: '2h ago', sentiment: 'bullish' },
              { title: `Analysts Maintain Buy on ${company.symbol}, Raise Target`, source: 'Mint', time: '5h ago', sentiment: 'bullish' },
              { title: `${company.sector} Sector Review: Market Analysis`, source: 'CNBC-TV18', time: '8h ago', sentiment: 'neutral' },
            ]).map((n, i) => (
              <div key={i} className="flex items-start gap-3 py-3 border-b border-bg-border last:border-0">
                <Badge variant={n.sentiment === 'bullish' ? 'green' : n.sentiment === 'bearish' ? 'red' : 'yellow'}
                  className="mt-0.5 shrink-0 capitalize">{n.sentiment || 'neutral'}</Badge>
                <div>
                  <p className="text-sm font-medium text-text-primary hover:text-accent-cyan cursor-pointer transition-colors">
                    {n.title || n.headline}
                  </p>
                  <p className="text-xs text-text-muted mt-1">{n.source} · {n.time || 'Recently'}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
