# SovAI Index

FastAPI + React demo for sovereign AI readiness. Transparent scoring, provenance, and clickable choropleth map.

## What’s inside
- FastAPI backend (`api/main.py`) with endpoints for countries, country detail, compare, and methodology.
- Scoring (`core/scoring.py`): policy/infra/language/risk -> readiness; writes snapshots to Postgres.
- Ingest & seed (`scripts/smoke_test.py`): applies schema, seeds demo countries (EU, IN, JP, KR, SA, SG), runs scoring, hits API.
- React + Vite frontend (`ui-frontend`): Overview, Country Detail, Compare, Methodology; choropleth map with EU region mapping.

## Prerequisites
- Python 3.11+
- Node 18+
- PostgreSQL (local or accessible)

## Quick start (dev)
1) Clone and install backend deps
```bash
python -m venv venv
./venv/Scripts/pip install -r requirements.txt   # Windows
# or: source venv/bin/activate && pip install -r requirements.txt
```

2) Seed demo data and compute scores (uses DB_* envs; defaults shown)
```bash
# Optional env overrides
# set DB_USER=postgres; set DB_PASSWORD=postgres; set DB_NAME=sovai; set DB_HOST=localhost; set DB_PORT=5432
./venv/Scripts/python.exe scripts/smoke_test.py
```

3) Run the API
```bash
./venv/Scripts/uvicorn.exe api.main:app --reload --port 8000
# Check: http://localhost:8000/health, /countries, /country/EU, /compare?iso=EU&iso=IN, /docs
```

4) Run the frontend
```bash
cd ui-frontend
npm install
npm run dev
# Open the URL Vite prints (default http://localhost:5173). API base defaults to http://localhost:8000.
# To target a different API: create ui-frontend/.env with VITE_API_BASE=http://host:port, then restart dev server.
```

## Tests
- Backend (lint + pytest + coverage):
  - PowerShell: `scripts\run_tests.ps1 -Dev`
  - Bash: `DEV=1 ./scripts/run_tests.sh`
- Frontend unit/component (vitest):
  - `cd ui-frontend && npm run test`
- Frontend E2E (Playwright, functional assertions):
  - `cd ui-frontend`
  - `npm run build && npm run preview`
  - `npm run e2e:install` (first time to install browsers)
  - In another shell: `npm run test:e2e`

CI (GitHub Actions)
- Backend job: ruff lint, pytest with coverage.
- Frontend job: eslint, vitest, build.
- E2E job: seeds DB, starts API + preview, runs Playwright (functional checks).

## Troubleshooting
- “Failed to fetch” in UI: ensure API is running on 8000 and VITE_API_BASE points to it; verify http://localhost:8000/health works.
- Empty data: rerun `scripts/smoke_test.py` and refresh.
- Map shows “No data”: ensure /countries returns readiness_score and topojson loads (defaults to CDN; can override with VITE_TOPO_URL).

## Docs
- `DEVELOPER_NOTES.md` — summary, gotchas (ISO mapping, jsdom, Mantine matchMedia), run/test/CI, roadmap.
- `docs/PLATFORM_READINESS_PLAN.md` — full platform plan and action backlog.
- `docs/README.md` — docs index (requirements, architecture, test plan, threat model, runbook, etc.).

