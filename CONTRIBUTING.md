Contributing Guide
==================

This repo aims to be transparent, testable, and easy to extend. Please follow the guidelines below.

Branching strategy
- main: protected; always deployable
- dev: optional integration branch
- feature/*: for features/enhancements, branch from main (or dev), use PRs
- hotfix/*: for urgent fixes off main

Commit & PR conventions
- Conventional commits recommended (feat:, fix:, docs:, chore:, refactor:, test:)
- Open a PR to merge feature/* into main (or dev), link issues, keep PRs focused
- Require at least one reviewer; CI must pass (backend tests + frontend build)

Code style & tests
- Python: keep functions small, documented; prefer explicit over clever
- Frontend: TypeScript, functional React, Mantine components
- Add/maintain unit tests in tests/; run scripts/run_tests before pushing

Local testing
- PowerShell: `scripts\run_tests.ps1 -Dev`
- Bash: `DEV=1 ./scripts/run_tests.sh`

Issue tracking & workflow
- Use GitHub Issues with templates (bug/feature)
- Add clear acceptance criteria and link PRs to issues
- Use labels: area/backend, area/frontend, priority/P1-3, type/bug/feat/chore

Releases
- Tag releases on main (e.g., v0.1.0) and create release notes

Security
- Do not commit secrets; use .env and examples only
- Report vulnerabilities privately to maintainers

