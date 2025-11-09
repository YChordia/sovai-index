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

