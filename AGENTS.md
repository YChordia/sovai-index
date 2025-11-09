Agent Working Notes
===================

Scope
- Instructions here apply to the whole repo unless overridden.

Principles
- Favor transparency: readable code, docstrings, comments explaining rationale
- Keep changes minimal and focused; avoid unrelated refactors
- Update docs and tests alongside code

Backend
- FastAPI app at `api/main.py`; add Pydantic models and typed responses
- Scoring resides in `core/scoring.py`; keep functions small, well-documented
- DB schema in `db/schema.sql`; prefer additive migrations

Frontend
- React + Vite + TypeScript in `ui-frontend/`
- Use Mantine for layout/components, Recharts for charts, react-simple-maps for choropleth
- API base from `VITE_API_BASE` with `http://localhost:8000` default

Testing
- Backend unit tests in `tests/`; pytest as runner
- Keep tests deterministic; avoid network in unit tests

CI/CD
- GitHub Actions in `.github/workflows/ci.yml` runs backend tests and frontend build
- PRs must pass CI before merging

Branching
- Use feature/* branches; open PRs to main (or dev)
- Conventional commits preferred

