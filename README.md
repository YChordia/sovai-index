# SovAI Index

Real‑time regulatory and language sovereignty intelligence.

- Maps: Regulation + Infra + Language/Knowledge Sovereignty → Readiness Score → Strategic Decisions.
- Transparent scoring: components, weights, and provenance from real documents.
- Useful for: where to invest and where to build sovereign AI infra.
- Feels like an early production tool (FastAPI + React), not a hack.

## Getting Started

### 1) Start Postgres and apply schema

- Ensure a local PostgreSQL is running and reachable.
- Defaults via env vars: `DB_NAME=sovai`, `DB_USER=sovai`, `DB_PASSWORD=sovai`, `DB_HOST=localhost`, `DB_PORT=5432`.
- Apply schema:
  - psql -h localhost -U sovai -d sovai -f db/schema.sql

### 2) Run ingestion and scoring

- Option A: Use your existing venv from `requirements.txt` (psycopg2, fastapi, requests, etc.).
- Fetch minimal seed policies and parse indicators:
  - python ingest/load_db.py
- Compute readiness scores (writes snapshots to `readiness_scores`):
  - python core/scoring.py

### 3) Run the FastAPI backend

- uvicorn api.main:app --reload --port 8000
- Health: http://localhost:8000/health → `{"status":"ok"}`
- Countries: http://localhost:8000/countries
- Country Detail: http://localhost:8000/country/EU
- Compare: http://localhost:8000/compare?iso=IN&iso=EU
- Methodology: http://localhost:8000/methodology

### 4) Run the UI frontend

- cd ui-frontend
- npm install
- npm run dev
- Open: http://localhost:5173 (uses API at http://localhost:8000 by default)
- To point to a different backend, set `VITE_API_BASE=http://your-host:8000`.

## Screenshots (placeholders)

- Overview: ui shows country table with readiness, a world map placeholder shaded by readiness, and Top 5/Bottom 5.
- Country Detail: score card, stacked bars for Policy vs Infra vs Language vs Risk, key indicators with source links, and methodology snippet.
- Compare: multi-select countries, chart comparing sub-scores, and short interpretive text.

## Notes & Assumptions

- Where real data is missing, we use clearly commented placeholders (e.g., infra and language).
- `policy_indicators` are extracted from raw policy text with simple keyword rules. Keys include normalized `mentions_*` flags and legacy equivalents for compatibility.
- Scoring stores snapshots with timestamps; rerun `core/scoring.py` to refresh.

## Development

- API: FastAPI app at `api/main.py` with Pydantic models and endpoints.
- Scoring: see `core/scoring.py` for readable, documented logic.
- Ingest: simple fetch + parse at `ingest/` (seed policies only for demo).
## For Developers

- See `DEVELOPER_NOTES.md` for a concise summary, gotchas (ISO mapping, jsdom, Mantine matchMedia), run/test/CI instructions, and roadmap.
