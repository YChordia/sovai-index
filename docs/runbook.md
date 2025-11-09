Runbook
=======

Smoke & seed
- `scripts/smoke_test.py` — applies schema, seeds demo, scores, hits API

Start services
- API: `uvicorn api.main:app --reload --port 8000`
- UI: `cd ui-frontend && npm run dev`

Common issues
- Choropleth shows 'No data': verify `/countries` and ISO mappings
- Frontend tests fail on matchMedia: ensure test setup polyfill
- jsdom version mismatch: Node 18 → jsdom ^24.1.0

DB
- Backup/restore procedures: TODO
- Migrations: additive changes in `db/schema.sql` (later, manage via Alembic)

Logs
- Add request timing and correlation IDs (TODO)

