#!/usr/bin/env bash
set -euo pipefail

PY="python"
if [[ -x "./venv/bin/python" ]]; then PY="./venv/bin/python"; fi
if [[ -x "../venv/bin/python" ]]; then PY="../venv/bin/python"; fi

if [[ -n "${DEV:-}" ]]; then
  if [[ -f requirements-dev.txt ]]; then
    "$PY" -m pip install -r requirements-dev.txt
  fi
fi

"$PY" -m pytest -q

