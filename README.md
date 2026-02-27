# Ottoneu GM Operating System (GMOS) — MVP (Full-stack)

This repo is a **functioning website** (Next.js) plus a **decision engine** and a **data pipeline** scaffold for an institutional-grade Ottoneu GMOS.

It runs in two modes:
- **Mock mode (default):** no credentials required; uses seeded data.
- **Live mode (optional):** plug in your Ottoneu cookies + league/team IDs and the scraper will ingest real data (you will need to maintain your own compliance with Ottoneu/FanGraphs terms).

> The goal of this MVP is to give you a working, deployable baseline with the *correct architecture*:
> ingestion → normalization → metrics → decision engines → UI.

## 0) Quick start (local)

### Prereqs
- Node 20+
- Docker (recommended) for Postgres

### 1) Start Postgres
```bash
docker compose up -d db
```

### 2) Install deps
```bash
npm install
```

### 3) Setup env
```bash
cp .env.example .env
```

### 4) Create DB + seed
```bash
npm run db:push
npm run db:seed
```

### 5) Run the site
```bash
npm run dev
```

Open http://localhost:3000

## 1) MVP pages
- `/` — portfolio-level summary (budget, roster, surplus)
- `/players` — player list + replacement baseline + surplus
- `/trades` — trade evaluator (2-side)
- `/ingest` — run ingestion (mock or live) from the browser

## 2) Live ingest (optional)
Set these in `.env`:
- `INGEST_MODE=live`
- `OTTONEU_LEAGUE_ID=...`
- `OTTONEU_TEAM_ID=...`
- `OTTONEU_COOKIE=...` (copy from your browser DevTools; **treat as sensitive**)

Then run:
```bash
npm run ingest
```

## 3) Deployment
- Works well on **Render / Railway / Fly.io** (Postgres + Node).
- For Vercel: host the Next.js app and move ingestion to a separate worker (or GitHub Action).

## 4) What’s included (MVP)
✅ Data model (teams, players, rosters, projections, market, replacement baselines, evaluations)  
✅ Replacement-level engine (position-aware)  
✅ Value model (Points → $ valuation with tunable curve)  
✅ Risk model (volatility + uncertainty penalty)  
✅ Decision engines:
- Keep/Cut
- Add/Drop
- Trade evaluator
- Budget allocator (basic)
✅ UI dashboards + API routes  
✅ Ingest scaffolding (mock + live adapter)

## 5) Next steps (V1)
- Arbitration + keeper inflation modeling
- Auction dynamics simulator (price distribution by tier)
- News + statcast feeds (external integrations)
- Multi-league benchmarking
- Alerting + scheduler (cron/queue)

---

**License:** MIT (you can change)
