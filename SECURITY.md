Security Policy
===============

Reporting
- Please report vulnerabilities privately to the maintainers. Do not open public issues for sensitive reports.

Scope
- FastAPI backend, React frontend, CI workflows, docs.

Practices
- No secrets in repo; use environment variables and CI secrets
- SAST (ruff, bandit) and dep scans (pip-audit, npm audit) in CI
- Threat modeling documented in `docs/threat-model.md`

