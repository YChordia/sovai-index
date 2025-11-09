Test Plan
=========

Levels
- Unit: pytest (backend), vitest (frontend)
- Integration: FastAPI TestClient; seeded DB
- E2E: Playwright; page flows; screenshots
- Visual: baseline images; diffs on PRs

Coverage
- Backend: pytest-cov thresholds (e.g., 70–80% initially)
- Frontend: vitest component coverage (later)

Environments
- Local: `scripts/smoke_test.py`, `npm run dev`
- CI: jobs per layer; artifacts (coverage, screenshots)

