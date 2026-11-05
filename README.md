<div align="center">

<img src="assets/banner.svg" alt="FinSight AI: live NSE data, AI company analysis, compare, screener and portfolio" width="100%" />

<a href="https://fin-sight-ai-six-kappa.vercel.app"><img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=500&size=20&pause=1200&color=8B5CF6&center=true&vCenter=true&width=760&lines=Live+prices+for+265+NSE+stocks;AI+analysis+that+shows+exactly+what+it+was+given;Compare%2C+screen%2C+track+a+portfolio+in+%E2%82%B9+and+%24;Guardrails%2C+evals+and+feedback+built+in;Try+it+as+a+guest+%E2%80%94+no+sign-up" alt="Typing animation of features" /></a>

[![CI](https://github.com/Pragylucky/FinSightAi/actions/workflows/ci.yml/badge.svg)](https://github.com/Pragylucky/FinSightAi/actions/workflows/ci.yml)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white&style=flat-square)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-animations-FF0055?logo=framer&logoColor=white&style=flat-square)
![Node](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white&style=flat-square)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white&style=flat-square)
![Gemini](https://img.shields.io/badge/AI-Gemini-8E75B2?logo=googlegemini&logoColor=white&style=flat-square)
![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

### [**Live demo**](https://fin-sight-ai-six-kappa.vercel.app) &nbsp;·&nbsp; [Product brief](docs/PRODUCT.md) &nbsp;·&nbsp; [AI evaluation](docs/EVAL.md) &nbsp;·&nbsp; [API health](https://finsight-backend-jlvd.onrender.com/health)

<sub>Click **Try it as a guest** on the demo, no sign-up needed. The API runs on a free tier, so the first request after idle can take ~30 seconds.</sub>

<br />

<img src="assets/demo.gif" alt="FinSight AI walkthrough: landing, dashboard with live index charts, dock, command palette, company analysis, compare, portfolio, screener, news and AI chat" width="900" />

<sub>A 25-second tour recorded from the running app</sub>

<br />

<table>
  <tr>
    <td align="center"><b>265</b><br /><sub>NSE stocks, live</sub></td>
    <td align="center"><b>10</b><br /><sub>pages in a floating dock</sub></td>
    <td align="center"><b>93%</b><br /><sub>stock-detection precision &amp; recall</sub></td>
    <td align="center"><b>23</b><br /><sub>automated tests + live AI eval</sub></td>
    <td align="center"><b>3</b><br /><sub>guardrails on every AI answer</sub></td>
  </tr>
</table>

</div>

---

## What it does

| | |
|---|---|
| **Live market data** | Real prices, indices, top gainers/losers and a ticker, for ~265 NSE stocks (large, mid and small caps), refreshed from Yahoo Finance. No mock data. |
| **Company analysis** | Search any listed company: live quote, price chart, key metrics (PE, PB, ROE, debt/equity, yield), quarterly results, news and an **AI-written analysis** with strengths, risks, outlook and a risk score. |
| **Compare stocks** | Up to four companies side by side: a rebased 3-month performance chart plus a metrics table with the best value in each row marked. |
| **Stock screener** | Filter ~265 stocks by sector, market-cap class, PE and ROE; sort any column; fundamentals stream in the background. |
| **AI chat** | Gemini-powered assistant that is handed **live quotes and ratios** for any stock you mention, so answers use real numbers. |
| **News** | Market headlines with search and filters (topic, stock, sentiment) and a sentiment estimate per story. |
| **Portfolio & watchlist** | Add holdings and targets, see value and P&L at live prices, sector allocation and per-holding returns. |
| **Mutual funds, SIP calculator, finance dictionary** | Fund returns from NAV history, a SIP growth calculator and a plain-English glossary. |
| **Interface** | A macOS-style floating **dock** (icons swell toward the cursor) instead of a sidebar, a bento dashboard with live Nifty / Sensex / Bank Nifty / USD-INR charts, an animated market ticker, command palette (⌘K, searches company names too), phone layout with a bottom tab bar, reduced-motion aware. |
| **Multi-currency portfolio** | Mix NSE and US holdings; each row shows its native currency and totals roll up in rupees at the live USD/INR rate. |

### Screens

<p align="center"><img src="assets/screens/dashboard.png" alt="Dashboard: live index chart, portfolio donut, movers and news" width="100%" /></p>
<p align="center"><sub><b>Dashboard.</b> Index tabs with real charts, portfolio value counting up, top movers and headlines.</sub></p>

<table>
  <tr>
    <td width="50%"><img src="assets/screens/company.png" alt="Company page with price chart" /><br /><sub><b>Company.</b> Live quote, chart, financials, AI analysis, news.</sub></td>
    <td width="50%"><img src="assets/screens/compare.png" alt="Compare stocks" /><br /><sub><b>Compare.</b> Up to four stocks, rebased to 0% so they line up.</sub></td>
  </tr>
  <tr>
    <td><img src="assets/screens/portfolio.png" alt="Portfolio with P&L and sector allocation" /><br /><sub><b>Portfolio.</b> P&amp;L per holding, sector allocation, edit in place.</sub></td>
    <td><img src="assets/screens/screener.png" alt="Screener with quick screens" /><br /><sub><b>Screener.</b> Quick screens, saved screens, sortable fundamentals.</sub></td>
  </tr>
  <tr>
    <td><img src="assets/screens/ai-analysis.png" alt="AI analysis tab" /><br /><sub><b>AI analysis.</b> Summary, outlook, risk score, strengths and risks, from the figures on the page.</sub></td>
    <td><img src="assets/screens/chat.png" alt="AI chat answering a comparison, then declining an off-topic question" /><br /><sub><b>AI chat.</b> Grounded in live data (see the source line); declines off-topic questions without a pointless disclaimer.</sub></td>
  </tr>
  <tr>
    <td><img src="assets/screens/news.png" alt="News with filters" /><br /><sub><b>News.</b> Topic, stock and sentiment filters.</sub></td>
    <td><img src="assets/screens/palette.png" alt="Command palette" /><br /><sub><b>⌘K palette.</b> Jump to any page or company.</sub></td>
  </tr>
  <tr>
    <td colspan="2"><img src="assets/screens/landing.png" alt="Landing page" /><br /><sub><b>Landing.</b> Same live ticker, guest login in one click.</sub></td>
  </tr>
</table>

<p align="center"><img src="assets/screens/dock.png" alt="The floating dock with the cursor hovering over an icon" width="70%" /></p>
<p align="center"><sub><b>The dock.</b> Icons swell as the cursor approaches; the active page glows.</sub></p>

<p align="center">
  <img src="assets/screens/mobile-dashboard.png" alt="Phone: dashboard" width="240" />&nbsp;&nbsp;
  <img src="assets/screens/mobile-portfolio.png" alt="Phone: portfolio" width="240" />
</p>
<p align="center"><sub><b>On a phone</b> the dock becomes a bottom tab bar with a "More" sheet.</sub></p>

---

## Product thinking

This was built like a product, not just a codebase.

| | |
|---|---|
| **[Product brief](docs/PRODUCT.md)** | Problem, target user, positioning against existing tools, RICE prioritisation (including what I chose *not* to build), success metrics, risks, roadmap |
| **[AI evaluation](docs/EVAL.md)** | Labelled test sets for grounding, faithfulness, honesty and safety. Runs in CI; stock-mention detection scores 93% precision / 93% recall |
| **[User testing plan](docs/USER_TESTING.md)** | Task script and recording template for validating the assumptions in the brief |

**AI quality loop, built into the app:**
- **Transparent:** the analysis shows exactly which figures the model was given ("What is this based on?"); chat shows which live data grounded the answer and when.
- **Measured:** 👍/👎 with a reason on every analysis and chat answer, plus latency, token cost, error rate and guardrail flags per call, via `GET /api/ai/stats`.
- **Guarded:** the disclaimer is added server-side and risky phrasing (guaranteed returns, hard buy/sell calls, price targets) is flagged, so safety doesn't depend on the prompt.
- **Funnel analytics:** guest → company page → AI analysis, via `GET /api/events/funnel`.

---

## Engineering highlights

These are the problems that were interesting to solve, not just features that were wired up.

- **Resilient market-data layer.** Yahoo's response schema changes often; a strict validation error used to blank an entire company profile. Calls now run with `validateResult: false`, fall back to a lighter endpoint, and serve the **last good value from a 24-hour stale cache** instead of failing, and the app never fabricates data. When a source is down it says so.
- **Works from a cloud host, not just my laptop.** Yahoo's session-crumb endpoints fail from some datacenter IPs, which once left the deployed ticker, movers, screener and AI analysis empty while everything worked locally. Prices, 52-week range and volume now fall back to the public chart endpoint (ratios stay empty rather than invented), and daily change is computed from the prior daily close, with a regression test.
- **Background snapshot service.** Screener, movers, ticker and landing page are served from an in-memory snapshot of ~265 stocks: two batched quote calls every 5 minutes, plus a bounded worker pool (5 concurrent) that fetches slower fundamentals once a day. First paint is instant instead of ~265 calls per request; partial data is flagged so the UI can show progress.
- **AI that isn't blocking and isn't made up.** Analysis lives on its own cached endpoint (6 h TTL) so a slow model call never breaks the company page; output is parsed defensively (markdown fences, extra prose) and validated; on failure it returns an error with a retry instead of a fake "Neutral" result. Chat detects stocks in the user's message and injects live data into the prompt.
- **Auth hardened end to end.** JWT access token plus `httpOnly` refresh cookie (`SameSite=None; Secure` in production for the cross-site Vercel ↔ Render setup), refresh-interceptor that can't deadlock on auth endpoints, rate limiting per IP behind a proxy, hashed reset tokens, optional email verification via a **6-digit code** (hashed at rest, 15-minute expiry, 5-attempt cap, resend cooldown), and one-click **guest accounts** that a nightly job garbage-collects.
- **Safe rendering.** AI replies go through a small Markdown renderer that builds React nodes (no `innerHTML`), closing an XSS hole.
- **Frontend architecture.** Route-level code splitting, a single design-token layer (CSS variables → Tailwind) so the whole palette changes in one place, shared motion primitives (`Stagger`, `Reveal`, `CountUp`), an error boundary, accessible modals/tabs, and a `prefers-reduced-motion` guard.
- **Quality gates.** ESLint clean, unit tests for the pure logic (symbol resolution, sentiment scoring, stock mention detection, formatters, universe integrity) and a GitHub Actions workflow that lints, tests and builds both apps on every push.

---

## Architecture

```mermaid
flowchart LR
  U[Browser: React 19 + Vite] -- REST + JWT --> API[Express API]
  API --> DB[(MongoDB: users, portfolios, watchlists)]
  API --> MS[Market snapshot service]
  MS -- batched quotes / fundamentals --> Y[(Yahoo Finance)]
  API -- quotes, profiles, charts, news --> Y
  API -- prompts + live data --> G[(Gemini API)]
  API -- NAV history --> MF[(mfapi.in)]
  API -- verification / reset --> E[(Resend or SMTP)]
```

```
finsight-frontend/   React app (pages, components, motion, lib, tests)
finsight-backend/    Express API (controllers, services, models, middleware, tests)
.github/workflows/   CI: lint + test + build for both apps
assets/              banner, demo GIF and screenshots used in this README
```

---

## Tech stack

**Frontend** React 19, Vite, React Router 7, Tailwind CSS, Framer Motion, Recharts, Lucide icons, Axios
**Backend** Node.js, Express, Mongoose, JWT, bcrypt, Helmet, express-rate-limit, node-cron, Nodemailer / Resend
**Data & AI** Yahoo Finance (`yahoo-finance2`), mfapi.in, Google Gemini
**Tooling** ESLint, Node's built-in test runner, GitHub Actions, Vercel (frontend), Render (backend), MongoDB Atlas

---

## Getting started

Prerequisites: Node 20+, a MongoDB connection string, and (optional) a [Gemini API key](https://aistudio.google.com).

```bash
git clone https://github.com/Pragylucky/FinSightAi.git
cd FinSightAi

# Backend
cd finsight-backend
cp .env.example .env        # fill in MONGODB_URI, JWT secrets, GEMINI_API_KEY
npm install
npm run dev                 # http://localhost:5000

# Frontend (new terminal)
cd finsight-frontend
npm install
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm run dev                 # http://localhost:3000
```

Everything works without an email provider: with verification off (the default) sign-up logs you in immediately, and **Try it as a guest** needs nothing at all.

### Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `MONGODB_URI` | backend | Database connection |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | backend | Token signing (use long random strings) |
| `CLIENT_URL` | backend | Allowed CORS origin and link base (no trailing slash) |
| `GEMINI_API_KEY` | backend | AI chat and company analysis |
| `GEMINI_MODEL` | backend, optional | Override the default model |
| `REQUIRE_EMAIL_VERIFICATION` | backend, optional | `true` to require the emailed 6-digit code |
| `RESEND_API_KEY` or `EMAIL_HOST/PORT/USER/PASS` | backend, optional | Email for codes and password reset |
| `FINNHUB_API_KEY` | backend, optional | Extra global headlines |
| `NODE_ENV=production` | backend | Enables secure cross-site cookies |
| `EXTRA_ORIGINS` | backend, optional | Extra comma-separated allowed origins, e.g. a Vercel preview URL |
| `VITE_API_URL` | frontend | Backend base URL, ending in `/api` |

See [`finsight-backend/.env.example`](finsight-backend/.env.example) for the full list.

### Tests

```bash
cd finsight-backend  && npm test         # unit tests + AI grounding eval
cd finsight-backend  && npm run eval     # live-model eval (needs GEMINI_API_KEY)
cd finsight-frontend && npm run lint && npm test && npm run build
```

---

## API overview

All routes are under `/api`. Everything except auth and `GET /market/pulse` requires a bearer token.

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register` · `/login` · `/guest` · `/refresh` · `/logout` · `/verify-email` · `/resend-code` · `/forgot-password` · `/reset-password/:token` · `GET /auth/me` |
| Market | `GET /market/overview` · `GET /market/pulse` (public) |
| Companies | `GET /companies/search?q=` · `/:symbol` · `/:symbol/analysis` · `/:symbol/chart?days=` · `/:symbol/quote` · `/:symbol/news` |
| Screener | `GET /screener` (sector, cap, PE/ROE filters, sort, paging) · `/screener/sectors` |
| Portfolio / watchlist | `GET/POST /portfolio`, `/portfolio/holdings` · `GET/POST/PUT/DELETE /watchlist` |
| News · Funds | `GET /news` · `GET /mutual-funds` |
| AI | `POST /ai/chat` · `POST /ai/feedback` · `GET /ai/stats` |
| Analytics | `POST /events` · `GET /events/funnel` |

---

## Deploying

- **Backend (Render or similar):** set the variables above, `NODE_ENV=production`, and `CLIENT_URL` to your frontend URL. Free tiers block outbound SMTP, so use `RESEND_API_KEY` if you enable verification or password reset.
- **Frontend (Vercel):** set `VITE_API_URL` to `https://<your-api>/api` and redeploy.
- After a cold start the stock snapshot warms in the background (~1 minute); the ROE / debt / growth columns fill in as they arrive.

---

## Roadmap

- Real-time quotes over WebSockets and price alerts
- Historical portfolio performance (daily snapshots)
- Persisted chat history and saved screens
- Broader coverage: all NSE equities and BSE, with sector indices

---

## Author

**Ronak Singh**
[GitHub](https://github.com/Pragylucky) · [LinkedIn](https://www.linkedin.com/in/ronak-singh-79234328a/)

> **Disclaimer:** FinSight AI is an educational project. Nothing here is financial advice, and sentiment and AI analysis are automated estimates that can be wrong. Do your own research.

Released under the [MIT License](LICENSE).

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,14,18&height=110&section=footer" width="100%" alt="" />
