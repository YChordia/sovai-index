Performance & Scalability
=========================

Objectives
- Define targets (SLOs), measure, and iterate.

Initial SLOs (dev/demo)
- API
  - /countries: p95 < 150 ms
  - /country/{iso}: p95 < 200 ms
  - /compare: p95 < 200 ms (3–5 countries)
- Frontend
  - First contentful render < 1.5s on dev laptop
  - Interactions (hover, route) < 100 ms perceived

Instrumentation Plan
- Short term
  - Log timing for each endpoint; include correlation id.
  - Measure response sizes; add DB indexes where needed.
- Mid term
  - Expose /metrics (Prometheus) with latency histograms.
  - Trace requests (OpenTelemetry) to DB calls.

Optimization Checklist
- DB
  - Index by countries.iso_code; readiness_scores(country_id, computed_at desc)
  - Avoid N+1 queries; prefer LATERAL joins like in /countries.
- API
  - Cache stable responses for a short TTL (e.g., /methodology).
- Frontend
  - Bundle split; lazy load charts; local topojson copy for tests.

Load Testing (staging)
- Tool: k6 or locust; scripts under `load/`
- Scenarios: /countries (1–50 rps), /country/{iso}, /compare with 3–5 isos.

