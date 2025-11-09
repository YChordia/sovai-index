Architecture
============

Context
- FastAPI backend (Postgres) + React (Vite) frontend; scoring pipeline.

Containers
- API: FastAPI app exposing endpoints; connects to Postgres
- Ingest: scripts to fetch/parse and load indicators
- Scoring: computes component and readiness scores; writes snapshots
- UI: Vite + React + Mantine; calls API

Data
- Tables: countries, policies, policy_indicators, infra_signals, readiness_scores
- Provenance: policy + indicators surfaced in UI

Decisions
- EU treated as region; member countries map to EU score on map
- ISO resolution: A2/A3/numeric id mapping for world atlas topojson

