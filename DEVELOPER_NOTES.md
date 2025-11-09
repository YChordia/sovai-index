SovAI Index — Developer Notes
=============================

Purpose
- Capture key decisions, gotchas, and the run/test/CI practices we converged on while turning the SovAI Index into a credible, demo‑ready product.

Overview
- Backend: FastAPI with transparent scoring and structured endpoints
- Ingestion: simple parser + seeding + smoke script
- Scoring: documented, readable policy/infra/language/risk components
- Frontend: React + Vite + TypeScript + Mantine; real choropleth map (react-simple-maps)
- Tests: Python (pytest) + Frontend (vitest + RTL + jsdom)
- CI: GitHub Actions for lint, tests, build, and Pages deploy (frontend)

Architecture (current)
- API (`api/main.py`):
  - `/` root with helpful links
  - `/health`
  - `/countries` → CountrySummary list (readiness + components)
  - `/country/{iso}` → CountryDetail with policies, indicators, methodology
  - `/compare?iso=IN&iso=EU` → subset of CountrySummary
  - `/methodology` → static but structured scoring method
- Scoring (`core/scoring.py`):
  - readiness = 0.4*policy + 0.3*infra + 0.2*language − 0.1*risk
  - policy_score from normalized `mentions_*` indicators (legacy keys supported)
  - infra_score neutral default when missing (low confidence)
  - language_score placeholder by ISO (EU/IN higher for demo)
  - risk_score = 100 − composite(policy, infra, language)
  - persists snapshots to `readiness_scores`
- Ingestion:
  - `ingest/parse_policies.py` extracts normalized indicators
  - `scripts/smoke_test.py` seeds demo countries (EU, IN, JP, KR, SA, SG), inserts minimal infra, runs scoring, then hits API
- Frontend (`ui-frontend/`):
  - Pages: Overview (table + choropleth + top/bottom), Country Detail, Compare, Methodology
  - Components: ScoreCard, StackedBars, CountryTable, WorldChoroplethMap
  - API base: `VITE_API_BASE` (defaults to `http://localhost:8000`)

Key Learnings / Gotchas
1) Choropleth ISO detection (critical!)
   - world-atlas `countries-110m.json` often uses numeric ISO 3166‑1 ids (e.g., 356 for India), not ISO_A2/ISO_A3.
   - Fix: derive ISO2 via a robust resolver:
     - Prefer `ISO_A2`
     - Else map `ISO_A3`→ISO2 (FRA→FR, DEU→DE, …)
     - Else map numeric `id` (padded to 3 digits)→ISO2 via lookup (356→IN, 250→FR, …)
     - Fallback: 2‑char `id` or 3‑char `id` through A3 map
   - EU behavior: member countries map to the EU score; hover text shows “European Union”; clicking routes to `/country/EU`.

2) Frontend debug workflow
   - Enable logs/overlay: in browser console → `window.SOVAI_DEBUG = true`
   - The map displays a small on‑card “Debug” box with `{ iso, name, target, score, rawId }` on hover.
   - Helpful to diagnose topojson property mismatches or missing data.

3) Mantine + Vitest + jsdom
   - Mantine’s color scheme hook requires `window.matchMedia`.
   - Add polyfill in `ui-frontend/src/test/setup.ts` using `vi.fn()`.
   - jsdom 27 requires Node 20+. We pinned jsdom to `^24.1.0` for Node 18.
   - Vitest config: `globals: true`, `environment: 'jsdom'`, `setupFiles: './src/test/setup.ts'`.

4) ESLint peer requirements
   - `@typescript-eslint/*@7` expects ESLint `^8.56.0`. We set ESLint `^8.57.0`.

5) API root 404
   - Added `/` route to avoid 404 on `http://localhost:8000/` and point to useful links.

Run & Reproduce
1) Database & schema
   - Ensure Postgres reachable; env defaults: `DB_NAME/USER/PASSWORD/HOST/PORT`.
   - `psql -h localhost -U sovai -d sovai -f db/schema.sql` (or use smoke script).

2) Seed + Score (demo)
   - `.\n+     venv\Scripts\python.exe scripts\smoke_test.py`
   - Seeds EU/IN/JP/KR/SA/SG, inserts basic infra, computes scores, and exercises API.

3) Backend
   - `.
     venv\Scripts\uvicorn.exe api.main:app --reload --port 8000`
   - Check: `/`, `/health`, `/countries`, `/country/EU`, `/compare?iso=EU&iso=IN`, `/docs`.

4) Frontend
   - `cd ui-frontend && npm install && npm run dev`
   - Default API: `http://localhost:8000` (configure via `ui-frontend/.env`: `VITE_API_BASE=...`)
   - Map: hover/click countries with data; EU members map to EU region.

Testing
- Backend (PowerShell): `scripts\run_tests.ps1 -Dev`
- Backend (bash): `DEV=1 ./scripts/run_tests.sh`
- Frontend: `cd ui-frontend && npm run test`
- Frontend test notes:
  - `WorldChoroplethMap.test.tsx` uses inline GeoJSON (numeric id for IN, ISO3 for FRA) to validate hover text + click behavior.
  - `setup.ts` loads `@testing-library/jest-dom` and polyfills `matchMedia`.

CI/CD (GitHub Actions)
- `.github/workflows/ci.yml`:
  - Backend job: install deps, ruff lint, pytest (+coverage.xml artifact)
  - Frontend job: install, eslint, vitest, build
  - Pages job (main): build and deploy `ui-frontend/dist` to GitHub Pages (enable Pages in repo settings)

Branching & Reviews (lightweight guidance)
- main: protected, always green
- feature/*: branch off `main`, open PRs, require passing CI
- hotfix/*: urgent fixes off `main`
- Conventional commits encouraged; link issues; keep PRs focused

Common Pitfalls
- “Pure text” frontend: missing Mantine CSS import (`@mantine/core/styles.css`) in `src/main.tsx`.
- Vite dev vs API ports: frontend at 5173, backend at 8000 (dev). In production, proxy behind port 80/443.
- Choropleth “No data” for real countries: check numeric id mapping and API readiness in `/countries`.
- ESLint peer errors: ensure ESLint `^8.57.0` with `@typescript-eslint@^7`.
- jsdom/node mismatch: use `jsdom@^24.1.0` on Node 18 or upgrade Node.

Roadmap / Future Enhancements
- Seed additional markets (US, AE, BR, CA, AU) for richer demo
- Continuous color scale + legend (d3-scale)
- Pre‑commit hooks (ruff, eslint) and coverage thresholds in CI
- Backend staging deploy (Docker + GHCR + chosen platform), HTTPS
- AuthN/Z for multi‑tenant SaaS; roles/features; VAPT/InfoSec reviews
- Region overlays beyond EU (e.g., ASEAN), richer infra and language signals

Cheat Sheet (Dev)
- API base: `http://localhost:8000`; UI dev: `http://localhost:5173`
- Debug map: `window.SOVAI_DEBUG = true`
- Smoke run: `scripts\smoke_test.py`
- Tests: `scripts\run_tests.ps1 -Dev` and `ui-frontend:npm run test`

