SovAI Index — Platform Readiness Plan
=====================================

Purpose
- Single, actionable plan covering engineering process, quality, security, performance, deployment, and support to mature SovAI Index into a robust product.

Scope
- Captures areas discussed: requirements → delivery pipeline → operations. Each section lists objectives and concrete steps.

1) Product Requirements & Traceability
- Objectives
  - Clear, versioned requirements; traceable to user stories, tests, and releases.
- Steps
  - Create/maintain `docs/requirements.md` with business goals, personas, and prioritized capabilities.
  - Use GitHub Issues for user stories with acceptance criteria; link to PRs.
  - Maintain `docs/traceability.md`: story → code → tests → CI runs → release tags.

2) User Stories & Test Cases
- Objectives
  - Each story has testable acceptance criteria; tests exist at the right level.
- Steps
  - Use Issue templates (feature_request) for user stories; add ACs.
  - Add unit tests (pytest, vitest) for logic; component tests for UI; E2E (Playwright) for flows.
  - Track coverage and set thresholds in CI (pytest-cov; later c8 for vitest).

3) Technical Design & ADRs
- Objectives
  - Document key decisions and architecture for maintainability.
- Steps
  - `docs/architecture.md` (context/containers/components/data flows).
  - `docs/adr/` for decisions (e.g., ISO mapping, EU overlay, jsdom pinning, CI policy).
  - `docs/runbook.md` for ops procedures (smoke, logs, restarts, migrations).

4) Coding Standards & Reviews
- Objectives
  - Consistent, safe, readable code; small PRs with reviews.
- Steps
  - Enforce linting: ruff (py), eslint+prettier (ui). Add pre-commit hooks.
  - Require passing CI + at least 1 review on PRs to `main`.
  - Use Conventional Commits; keep PRs focused; link issues.

5) Testing Strategy (Unit → Integration → E2E → Visual)
- Objectives
  - Fast feedback and high confidence across layers.
- Steps
  - Unit: pytest for scoring; vitest for UI units.
  - Integration: FastAPI TestClient on API; DB seeded with ephemeral data.
  - E2E: Playwright to navigate pages and assert content; add screenshot snapshots.
  - Visual: baseline screenshots; produce diffs on PRs; store as CI artifacts.

6) Security & Vulnerability Management
- Objectives
  - Shift-left security; continuous scanning; incident response ready.
- Steps
  - SAST: ruff rules + bandit (py), eslint security plugins.
  - Dependency scans: Dependabot; pip-audit, npm audit on CI.
  - Secrets: pre-commit secret scan; avoid committing `.env`; use GitHub secrets.
  - DAST (optional): OWASP ZAP baseline against local app in CI.
  - `SECURITY.md`: reporting policy; `docs/threat-model.md` with STRIDE and mitigations.

7) Performance, Latency & Scalability
- Objectives
  - Set SLOs, instrument, and plan to scale.
- Steps
  - `docs/performance.md`: SLOs (p95 latency for /countries, /country/{iso}), budgets for client render time.
  - Instrument: basic logging + request timing; later add metrics (Prometheus/OpenTelemetry) and traces.
  - Optimize: pagination on lists; caching for stable endpoints; DB indexes; N+1 query checks.
  - Load tests (locust/k6) in staging before major releases.

8) Observability & Reliability
- Objectives
  - Know when things break; fast diagnosis.
- Steps
  - Centralized logs; error capture with correlation IDs.
  - Health checks: `/health` and `/` already present; add `/metrics` later.
  - Alerts on 5xx rate, latency, error budgets.
  - Backups & restore plan for Postgres; `docs/runbook.md` includes procedures.

9) CI/CD & Environments
- Objectives
  - Repeatable builds; safe deploys; quick rollbacks.
- Steps
  - CI: already running lint/tests/build for backend/frontend.
  - Add Playwright job; coverage thresholds; artifacts upload.
  - CD: deploy frontend to GitHub Pages (done); plan API deploy (Docker + managed Postgres).
  - Environments: dev (local), staging, prod with separate secrets.

10) Cloud Deployment & Infra as Code (Next Phase)
- Objectives
  - One-command infra setup; secure defaults; least-privilege.
- Steps
  - Containerize API (Dockerfile); use GHCR.
  - Provision via IaC (Terraform/Pulumi) for app + DB + networking.
  - HTTPS, WAF, rate limiting; private DB; minimal inbound.
  - Blue/green or canary deploys for API.

11) Data Governance & Privacy
- Objectives
  - Clear data lineage; retention; PII handling.
- Steps
  - Document data sources, retention policies.
  - Anonymize logs; scrub PII; add consent if user data introduced.

12) Accessibility & Internationalization
- Objectives
  - Inclusive UX; global reach.
- Steps
  - A11y checks; keyboard nav; color contrast.
  - I18n scaffolding for UI strings; locale-aware formats.

13) Release Management & Notes
- Objectives
  - Predictable releases with documented changes.
- Steps
  - Tag versions; `CHANGELOG.md` or GitHub Releases notes.
  - Include known issues, upgrade steps.

14) Support & Onboarding
- Objectives
  - Smooth onboarding; known support contacts; SLAs.
- Steps
  - `SUPPORT.md`: channels and SLAs.
  - `docs/onboarding.md`: local setup, common workflows, links.

Execution Plan (Phased)
- Phase 1 (now):
  - Add docs scaffolding (requirements, architecture, test plan, runbook, threat model, performance, traceability).
  - Add Playwright E2E tests with screenshots and CI job.
  - Add pre-commit hooks (ruff, eslint) and coverage thresholds.
- Phase 2:
  - Backend containerization; staging deploy; metrics and basic alerts.
  - Load testing baseline; enable Dependabot.
- Phase 3:
  - IaC for prod; HTTPS; WAF/rate limiting; DAST job; SLO dashboards.
  - Access controls, multi-tenant auth, roles.

Action Backlog (Next Steps)
---------------------------
- E2E visual tests (Playwright)
  - Seed DB → start API (uvicorn) → preview UI → run e2e and capture screenshots
  - Store baselines; upload diffs as CI artifacts; local topojson for determinism
- Docs scaffolding (create and link from docs/README.md)
  - requirements.md, user-stories.md, architecture.md, test-plan.md, threat-model.md, runbook.md,
    traceability.md, onboarding.md, SECURITY.md, SUPPORT.md, CHANGELOG.md
- CI/CD
  - Frontend: add Playwright job; enforce vitest and eslint
  - Backend: coverage thresholds; pip-audit/npm audit; Dependabot
  - Optional DAST: OWASP ZAP baseline against local app
- Security
  - Add bandit to CI; pre-commit secret scanning; fill SECURITY.md; complete threat-model.md
- Performance/Observability
  - Add request timing + correlation IDs; DB indexes; /metrics endpoint (Prometheus); OpenTelemetry plan
- Deployment
  - Dockerize API/UI; push to GHCR; staging deploy (Render/Fly/Cloud Run) with managed Postgres
- Frontend polish
  - Continuous color scale + legend; additional region overlays; a11y/i18n scaffolding
- Data/Seeds
  - Add US/AE/BR/CA/AU demo entries with minimal indicators + infra


Notest that helped drive creating other documents to track open items - 

Here’s a consolidated, actionable backlog of pending tasks we discussed. I grouped by area and kept items concrete so you can open issues/PRs directly.

E2E Visual Tests

Add Playwright setup (screenshots): seed DB → start API (uvicorn) → build/preview UI → run e2e → upload artifacts.
Cover pages: Overview (table + map), Country Detail (score/stacked bars), Compare (chart), Methodology.
Store baseline images in repo, diff on PRs; keep world topojson local for deterministic tests.
Docs & Traceability

Add scaffolds in docs/:
requirements.md (business goals/personas/priorities)
user-stories.md (issue templates + ACs)
architecture.md (context/containers/data flows)
test-plan.md (unit/integration/e2e/visual, coverage)
threat-model.md (STRIDE + mitigations)
runbook.md (smoke, migrations, restarts, logs)
traceability.md (story → code → tests → CI → release)
onboarding.md (env setup, workflows)
SECURITY.md (reporting, contact, scope)
SUPPORT.md (channels, SLAs)
CHANGELOG.md (release notes)
Add ADRs in docs/adr/ for key decisions (ISO mapping, EU overlay, jsdom pin, CI policy).
CI/CD Enhancements

Frontend: add Playwright job (build/preview, e2e screenshots).
Backend: enforce coverage thresholds; upload coverage badge/artifact.
Add pip-audit/npm audit jobs; enable Dependabot (pip/npm).
Optional: OWASP ZAP baseline job against local app.
Security

Add bandit (Python) to CI; eslint security plugin for frontend.
Pre-commit secret scan (e.g., detect-secrets); ensure secrets only via env/CI.
Fill SECURITY.md; add threat-model doc.
Performance & Observability

Implement request timing logs (API), correlation IDs.
Add DB indexes (e.g., countries.iso_code, readiness_scores(country_id, computed_at DESC)).
Add /metrics exporter (Prometheus) as a follow-up; OpenTelemetry later.
Define and track SLOs (docs/performance.md already added).
Deployment

Dockerize API and UI; publish images to GHCR.
Staging deploy for API (Render/Fly/Cloud Run) with managed Postgres; secrets via platform.
GitHub Actions: staging deploy job on main, manual prod promotion.
Backups/restore plan for Postgres (document in runbook).
Frontend Polish

Add continuous color scale (d3-scale) + legend component.
Make EU overlay themable; consider additional region overlays (e.g., ASEAN).
Accessibility: keyboard nav, focus rings, color contrast; check tooltips for screen readers.
Internationalization scaffolding (i18n strings, date/number formatting).
Backend Enhancements

Pagination for /countries, limit fields (projection) if needed.
Cache stable routes (/methodology) with short TTL.
Richer language_score plumbing (hook to real signals when available).
Add confidence metadata (e.g., infra confidence low/medium) to API.
Data & Seeds

Expand smoke seeds: US, AE, BR, CA, AU; keep indicators + infra minimal but realistic.
Ensure provenance: keep policy source_url and indicator keys as you have now.
Repo Hygiene & Hooks

Pre-commit hooks:
Python: ruff, pytest -q for changed modules (or fast target)
Frontend: eslint, vitest for changed packages
CODEOWNERS for API/UI/Docs ownership.
Tracking & Releases

Use GitHub Projects for backlog (columns: Backlog, In Progress, Review, Done).
Labels: area/backend, area/frontend, P1/P2/P3, type/bug/feat/chore/security.
Release tags with CHANGELOG; attach artifacts (coverage, screenshots).
Screenshots & Chat History

Add Playwright screenshots to CI artifacts and a baseline folder.
Paste raw session into docs/chat-logs/2025-11-09-session.md (placeholder exists).
Keep DEVELOPER_NOTES.md current with major learnings/changes.
Suggested 2‑Sprint Sequence

Sprint 1:
Playwright e2e + screenshots (local + CI).
Docs scaffolding (requirements, test-plan, architecture, runbook, threat-model).
Pre-commit hooks; bandit/pip-audit/npm audit in CI.
Seed US/AE/BR/CA/AU; color legend; small map polish.
Sprint 2:
Dockerize + staging API deploy; basic metrics/logging; SLO tracking.
Load testing (k6/locust) on staging; tune indexes/queries.
A11y/i18n scaffolding; coverage thresholds; CHANGELOG + release cadence.
If you want, I can start by implementing Playwright e2e screenshots and the docs scaffolding (requirements/test-plan/architecture/runbook/threat-model/traceability) as a focused PR set.