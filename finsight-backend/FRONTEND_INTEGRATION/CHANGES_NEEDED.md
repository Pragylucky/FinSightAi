# CHANGES NEEDED IN YOUR FRONTEND
# Read this carefully — it tells you exactly what to do file by file

====================================================================
## PART A — FILES TO COPY (from FRONTEND_INTEGRATION/ folder)
====================================================================

1. api.js
   FROM: FRONTEND_INTEGRATION/api.js
   TO:   finsight-ai/src/services/api.js          ← create the services/ folder

2. AuthContext.jsx
   FROM: FRONTEND_INTEGRATION/AuthContext.jsx
   TO:   finsight-ai/src/context/AuthContext.jsx  ← REPLACE the existing file

3. main.jsx
   FROM: FRONTEND_INTEGRATION/main.jsx
   TO:   finsight-ai/src/main.jsx                 ← REPLACE the existing file

4. pages/Auth.jsx
   FROM: FRONTEND_INTEGRATION/pages/Auth.jsx
   TO:   finsight-ai/src/pages/Auth.jsx           ← REPLACE the existing file

5. pages/Dashboard.jsx
   FROM: FRONTEND_INTEGRATION/pages/Dashboard.jsx
   TO:   finsight-ai/src/pages/Dashboard.jsx      ← REPLACE the existing file

6. pages/Company.jsx
   FROM: FRONTEND_INTEGRATION/pages/Company.jsx
   TO:   finsight-ai/src/pages/Company.jsx        ← REPLACE the existing file

7. pages/Chat.jsx
   FROM: FRONTEND_INTEGRATION/pages/Chat.jsx
   TO:   finsight-ai/src/pages/Chat.jsx           ← REPLACE the existing file

8. .env.local
   FROM: FRONTEND_INTEGRATION/.env.local
   TO:   finsight-ai/.env.local                   ← create in frontend ROOT (not src/)

====================================================================
## PART B — OTHER PAGES (OtherPages.jsx - Portfolio, Watchlist, News, Screener)
====================================================================

These pages (Portfolio, Watchlist, News, Screener) still use mock data.
You can connect them gradually. Here's how for each:

--- Portfolio ---
In OtherPages.jsx, find the Portfolio function.

Add at the top:
  import api from '../services/api';

Replace the line:
  const totalInvested = portfolioHoldings.reduce(...)
With a useEffect that calls:
  const data = await api.portfolio.get();
  // data.portfolio.holdings has the real holdings
  // data.portfolio.summary has totals

--- Watchlist ---
Find the Watchlist function. The remove button already has:
  const remove = (symbol) => setItems(...)

Replace with:
  const remove = async (symbol) => {
    await api.watchlist.remove(symbol);
    setItems(prev => prev.filter(i => i.symbol !== symbol));
  };

For adding to watchlist, the "Add Stock" button calls:
  await api.watchlist.add({ symbol, name });

--- News ---
Find the News function. Add useEffect:
  useEffect(() => {
    api.news.get(filter === 'all' ? 'general' : filter)
      .then(data => setNewsItems(data.news || []))
      .catch(() => {}); // keep mock on error
  }, [filter]);

--- Screener ---
The screener already filters client-side. To use backend:
  useEffect(() => {
    api.screener.get({ sector: filters.sector, peMax: filters.peMax, roeMin: filters.roeMin })
      .then(data => setStocks(data.stocks || []))
      .catch(() => {});
  }, [filters]);

====================================================================
## PART C — BACKEND SETUP
====================================================================

1. Create finsight-backend/.env (copy from .env.example):

   MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/finsight
   JWT_SECRET=run_this_to_generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   JWT_REFRESH_SECRET=generate_another_one_same_way
   JWT_EXPIRE=15m
   JWT_REFRESH_EXPIRE=7d
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ANTHROPIC_API_KEY=sk-ant-your-key-from-console.anthropic.com
   FINNHUB_API_KEY=your-key-from-finnhub.io
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your.gmail@gmail.com
   EMAIL_PASS=your_16char_app_password

2. Get MongoDB URI (free):
   → Go to https://cloud.mongodb.com
   → Create free M0 cluster
   → Database Access → Add user (username + password)
   → Network Access → Add IP → 0.0.0.0/0 (allow all)
   → Connect → Drivers → copy the connection string
   → Replace <password> with your DB user password

3. Get Anthropic API key:
   → https://console.anthropic.com → API Keys → Create key

4. Get Finnhub API key (free, no card):
   → https://finnhub.io → Register → Dashboard → API Key

5. Gmail App Password:
   → Google Account → Security → 2-Step Verification (enable)
   → App Passwords → Select app: Mail → Generate
   → Copy the 16-char password (no spaces)

====================================================================
## PART D — RUNNING BOTH SERVERS
====================================================================

Open TWO terminal windows:

TERMINAL 1 — Backend:
  cd finsight-backend
  npm install
  npm run dev
  → Should say "MongoDB Connected" and "Running on :5000"

TERMINAL 2 — Frontend:
  cd finsight-ai
  npm install      (if not done)
  npm run dev
  → Opens at http://localhost:3000

Now go to http://localhost:3000 → Sign up → use the app with real data!

====================================================================
## PART E — WHAT'S REAL vs STILL MOCK
====================================================================

REAL (connected to backend):
  ✅ Login / Signup / Logout (JWT auth)
  ✅ AI Chat (Claude API via backend)
  ✅ Company data (Finnhub real-time prices)
  ✅ Portfolio (stored in MongoDB)
  ✅ Watchlist (stored in MongoDB)
  ✅ News (Finnhub market news)

STILL MOCK (can connect later):
  ⏳ Market ticker (Nifty, Sensex indices)
  ⏳ Top gainers / losers (need a dedicated endpoint)
  ⏳ Quarterly results (need BSE/NSE API)
  ⏳ Mutual funds data
  ⏳ Stock screener (uses local data but filters work)

====================================================================
## PART F — DEPLOY TO PRODUCTION
====================================================================

BACKEND → Render (free):
  1. Push finsight-backend/ to GitHub
  2. Go to render.com → New Web Service → connect repo
  3. Build command: npm install
  4. Start command: node server.js
  5. Add all .env variables in Render's Environment section
  6. Deploy → get URL like: https://finsight-backend.onrender.com

FRONTEND → Vercel (free):
  1. Push finsight-ai/ to GitHub
  2. Go to vercel.com → New Project → import repo
  3. Add environment variable:
     VITE_API_URL = https://finsight-backend.onrender.com/api
  4. Add vercel.json to frontend root:
     { "rewrites": [{ "source": "/(.*)", "destination": "/" }] }
  5. Deploy → get URL like: https://finsight-ai.vercel.app

Then in your backend .env on Render, update:
  CLIENT_URL=https://finsight-ai.vercel.app

====================================================================
