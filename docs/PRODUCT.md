# FinSight AI: product brief

> Status: v1 shipped. Sections marked **Hypothesis** are assumptions I still need to validate with real users (see [USER_TESTING.md](USER_TESTING.md)). I have not run those sessions yet, and nothing below pretends otherwise.

## 1. Problem

First-time Indian retail investors (the wave that arrived after 2020) face a research gap:

- Real research tools (screeners, filings, ratio dashboards) assume you already know what a good ROE or debt/equity looks like.
- Beginner content explains the terms but never connects them to the actual company you are looking at.
- General-purpose chatbots will happily quote a PE ratio, but from memory: stale, sometimes invented, and with no way to check it.

**The gap:** someone who can't yet read a balance sheet needs the *numbers and the explanation in the same place*, with proof of where the numbers came from.

## 2. Who it's for

| | Primary | Secondary |
|---|---|---|
| Who | Salaried 22-30 year old, 0-3 years investing, mostly mutual funds, now curious about direct stocks | Finance / commerce students building a research habit |
| Job to be done | "Before I put money in, help me understand if this company is sound, in language I get." | "Help me practise analysing companies without paying for a terminal." |
| Today's workaround | Reddit, YouTube, broker app tips, asking ChatGPT | Textbooks + screener sites |

**Hypothesis:** the biggest pain is *trust*, not data access. People already get numbers from their broker app; what they lack is a way to judge them and to know an AI answer isn't made up.

## 3. Positioning (honest)

Screener.in, Tickertape and broker apps all have deeper data than this project. FinSight does not try to win on coverage (~265 NSE stocks). The bet is narrower:

1. **Explanation next to data.** Every company page has an AI analysis built *only* from the numbers on screen.
2. **Verifiable AI.** The analysis shows exactly what the model was given ("What is this based on?"), and chat shows which live data it was grounded in. When it has no data, it says so.
3. **Zero friction.** Guest mode, no sign-up, so a first-time visitor reaches value in under a minute.

## 4. What I built, and why (prioritisation)

Scored with RICE (Reach × Impact × Confidence ÷ Effort), 1-5 scales, my own estimates:

| Feature | R | I | C | E | Score | Decision |
|---|---|---|---|---|---|---|
| Guest mode (kill sign-up friction) | 5 | 4 | 4 | 1 | 80.0 | Built |
| AI feedback (👍/👎 + reason) | 4 | 3 | 5 | 1 | 60.0 | Built: nothing else tells me whether the AI is any good |
| Live data, no mock numbers (trust baseline) | 5 | 5 | 5 | 3 | 41.7 | Built |
| AI analysis grounded in live data + "based on" disclosure | 4 | 5 | 4 | 2 | 40.0 | Built |
| Compare stocks | 3 | 4 | 4 | 2 | 24.0 | Built |
| Screener with quick screens | 4 | 3 | 4 | 2 | 24.0 | Built |
| Broker integration (import real portfolio) | 4 | 5 | 2 | 5 | 8.0 | **Not built**: needs regulated partnerships (Account Aggregator / broker APIs) |
| Price alerts / push notifications | 3 | 3 | 3 | 4 | 6.8 | **Not built**: needs a job runner, email/push infra and a retention story I can't test yet |
| Email verification (kept optional) | 2 | 1 | 3 | 2 | 3.0 | Made optional: it caused dead-ends and blocked the first-use moment |
| Social / community features | 2 | 2 | 2 | 4 | 2.0 | **Not built**: cold-start problem, no evidence anyone wants it |

**A decision worth noting:** I originally required verified email. Real sign-up attempts hit expired links and unverified dead-ends, which is exactly the friction that kills a first session. I replaced it with an optional 6-digit code and one-click guest mode. Trade-off: guest accounts can't sync across devices, and I accept that for v1.

## 5. Success metrics

| Level | Metric | How it's measured today |
|---|---|---|
| North star | **AI analyses opened per active user** (AI tab opens ÷ users who viewed a company) | ✅ `GET /api/events/funnel` |
| Activation | Guest click → first company page viewed; company page → AI tab opened | ✅ `GET /api/events/funnel` |
| Engagement | Users who used Compare, a quick screen, or chat | ✅ `GET /api/events/funnel` |
| AI quality | **Helpful rate** = 👍 ÷ all votes, per feature | ✅ `GET /api/ai/stats` |
| AI quality | Downvote reasons (wrong numbers / unclear / generic / unhelpful) | ✅ `GET /api/ai/stats` |
| AI reliability | Error rate, p50 / p95 latency, cache-hit rate | ✅ `GET /api/ai/stats` |
| AI cost | Average input / output tokens per call | ✅ `GET /api/ai/stats` |
| AI safety | Answers that tripped a guardrail (guaranteed returns, hard buy/sell, price targets) | ✅ `GET /api/ai/stats` |
| AI correctness | Faithfulness / honesty / safety / schema pass-rates on a fixed question set | ✅ `npm run eval` (see [EVAL.md](EVAL.md)) |

**Targets I'd hold myself to once there is traffic:** helpful rate ≥ 70%, error rate < 2%, p95 latency < 8 s, guardrail flags < 1% of answers, faithfulness ≥ 90% on the eval set.

## 6. AI product decisions

- **Grounding over fluency.** Chat detects stocks in the question and injects live quote and ratios into the prompt; analysis only sees fields that exist. Measured on a labelled set, stock detection scores 93% precision and 93% recall over 22 queries. The one miss is a genuinely ambiguous name ("Tata Motors" after the demerger).
- **Fail visibly.** If the model returns unreadable JSON the UI shows an error and a retry, not a fake "Neutral, risk 50". A made-up answer is worse than no answer in finance.
- **Guardrails outside the model.** The disclaimer is appended server-side whether or not the model wrote it, and risky phrasing is flagged and counted, so safety doesn't depend on prompt luck.
- **Transparency.** Analysis shows the exact inputs, model and timestamp. Chat shows which stocks' live data it used and when.
- **Cost control.** Analysis is cached for 6 h per stock; chat keeps the last 10 messages and caps output at 1,500 tokens; tokens per call are recorded.
- **Isolation.** The analysis lives on its own endpoint so a slow model call can never break the company page.
- **Known limitation:** news "sentiment" is keyword-based, not model-based, and is labelled an estimate everywhere.

## 7. Risks

| Risk | Mitigation / status |
|---|---|
| Unofficial Yahoo Finance data can change or disappear | Stale-while-error cache, defensive parsing, clear "data unavailable" states. Long term: a licensed feed |
| AI output reads like advice | Server-side guardrail and disclaimer, flag-rate metric. SEBI regulates *investment advice*; this is positioned as education only |
| Free-tier cold starts hurt first impressions | README warns; pages degrade gracefully. Paid hosting would remove it |
| Low trust in a new, unknown tool | "What is this based on?" disclosure; no fabricated data anywhere |

## 8. Roadmap (in order)

1. ~~Instrument the funnel~~ (done: guest → company page → AI tab, plus Compare / screens / chat).
2. **Run 5 user sessions** with the script in [USER_TESTING.md](USER_TESTING.md) and write up what changed.
3. **Retention loop:** watchlist price-target email alerts, but only if sessions show people come back for the watchlist.
