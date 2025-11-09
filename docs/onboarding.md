Onboarding
==========

Prereqs
- Python 3.11, Node 18, Postgres

Setup
- Clone repo; create venv; `pip install -r requirements.txt`
- `scripts/smoke_test.py` to seed demo data
- API: `uvicorn api.main:app --reload --port 8000`
- UI: `cd ui-frontend && npm install && npm run dev`

Tests
- Backend: `scripts\run_tests.ps1 -Dev`
- Frontend: `cd ui-frontend && npm run test`

Debug map
- In console: `window.SOVAI_DEBUG = true` to show hover debug panel

