Threat Model
============

Scope
- Public API and UI; Postgres; CI/CD; secrets.

STRIDE (initial)
- Spoofing: AuthN planned for SaaS; protect admin endpoints
- Tampering: Input validation; ORM parameterization
- Repudiation: Access logs; correlation IDs
- Information disclosure: No secrets in repo; avoid PII; HTTPS in prod
- DoS: Rate limiting/WAF in front of API; caching on stable endpoints
- Elevation: Least privilege DB creds; no shelling out in API

Controls
- SAST (ruff/bandit), dep scan (pip-audit/npm audit), secret scanning
- DAST (ZAP) in CI (baseline)

Open items
- [ ] Fill assets/actors/data flows; trust boundaries
- [ ] Add risk ratings and mitigations per threat

