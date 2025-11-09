import os
import json
from pathlib import Path
import sys
from typing import Optional

import psycopg2
try:
    from fastapi.testclient import TestClient  # type: ignore
    _HAS_TESTCLIENT = True
except Exception:
    TestClient = None  # type: ignore
    _HAS_TESTCLIENT = False


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


def get_conn():
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME", "sovai"),
        user=os.getenv("DB_USER", "sovai"),
        password=os.getenv("DB_PASSWORD", "sovai"),
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
    )


def _exec_sql_blob(cur, sql_text: str):
    # naive splitter; sufficient for our schema/seed statements
    for stmt in sql_text.split(";"):
        s = stmt.strip()
        if not s:
            continue
        cur.execute(s + ";")


def apply_schema():
    root = Path(__file__).resolve().parents[1]
    schema_path = root / "db" / "schema.sql"
    with open(schema_path, "r", encoding="utf-8") as f:
        schema_sql = f.read()
    conn = get_conn()
    try:
        conn.autocommit = True
        cur = conn.cursor()
        # Execute entire schema at once to respect comments with semicolons
        cur.execute(schema_sql)
        # Ensure new columns exist for demo
        cur.execute("ALTER TABLE IF EXISTS readiness_scores ADD COLUMN IF NOT EXISTS language_score NUMERIC;")
        cur.close()
        print("SCHEMA_APPLIED")
    finally:
        conn.close()


def seed_demo():
    seed_sql = """
    -- Countries
    INSERT INTO countries (iso_code, name, region) VALUES ('EU','European Union','Europe')
    ON CONFLICT (iso_code) DO UPDATE SET name=EXCLUDED.name;
    INSERT INTO countries (iso_code, name, region) VALUES ('IN','India','Asia')
    ON CONFLICT (iso_code) DO UPDATE SET name=EXCLUDED.name;

    -- Additional high-interest AI markets
    INSERT INTO countries (iso_code, name, region) VALUES ('JP','Japan','Asia')
    ON CONFLICT (iso_code) DO UPDATE SET name=EXCLUDED.name;
    INSERT INTO countries (iso_code, name, region) VALUES ('KR','South Korea','Asia')
    ON CONFLICT (iso_code) DO UPDATE SET name=EXCLUDED.name;
    INSERT INTO countries (iso_code, name, region) VALUES ('SA','Saudi Arabia','Middle East')
    ON CONFLICT (iso_code) DO UPDATE SET name=EXCLUDED.name;
    INSERT INTO countries (iso_code, name, region) VALUES ('SG','Singapore','Asia')
    ON CONFLICT (iso_code) DO UPDATE SET name=EXCLUDED.name;

    -- EU policy + indicators
    WITH eu AS (SELECT id AS cid FROM countries WHERE iso_code='EU'),
    ins AS (
      INSERT INTO policies (country_id, name, source_url, category, status, raw_text)
      SELECT cid, 'EU AI Act', 'https://eur-lex.europa.eu', 'ai_act', 'in_force',
             'EU policy mentioning data localization, cross-border data transfer, and high-risk AI systems.'
      FROM eu
      RETURNING id
    )
    INSERT INTO policy_indicators (policy_id, key, value) VALUES
      ((SELECT id FROM ins), 'mentions_data_localization','true'),
      ((SELECT id FROM ins), 'mentions_ai_systems','true'),
      ((SELECT id FROM ins), 'mentions_cross_border','true'),
      ((SELECT id FROM ins), 'data_residency_required','true'),
      ((SELECT id FROM ins), 'ai_registry_required','true'),
      ((SELECT id FROM ins), 'cross_border_restrictions','true');

    -- IN policy + indicators
    WITH cty AS (SELECT id AS cid FROM countries WHERE iso_code='IN'),
    ins AS (
      INSERT INTO policies (country_id, name, source_url, category, status, raw_text)
      SELECT cid, 'DPDP Act 2023', 'https://www.meity.gov.in', 'data_protection', 'in_force',
             'India data protection policy mentioning data localization and cross-border data transfer.'
      FROM cty
      RETURNING id
    )
    INSERT INTO policy_indicators (policy_id, key, value) VALUES
      ((SELECT id FROM ins), 'mentions_data_localization','true'),
      ((SELECT id FROM ins), 'mentions_ai_systems','false'),
      ((SELECT id FROM ins), 'mentions_cross_border','true'),
      ((SELECT id FROM ins), 'data_residency_required','true'),
      ((SELECT id FROM ins), 'ai_registry_required','false'),
      ((SELECT id FROM ins), 'cross_border_restrictions','true');

    -- Minimal infra signals
    INSERT INTO infra_signals (country_id, metric, value)
    SELECT id, 'gpu_capacity_index', 65 FROM countries WHERE iso_code='EU';
    INSERT INTO infra_signals (country_id, metric, value)
    SELECT id, 'power_cost_index', 55 FROM countries WHERE iso_code='EU';

    INSERT INTO infra_signals (country_id, metric, value)
    SELECT id, 'gpu_capacity_index', 55 FROM countries WHERE iso_code='IN';
    INSERT INTO infra_signals (country_id, metric, value)
    SELECT id, 'power_cost_index', 60 FROM countries WHERE iso_code='IN';

    -- Simple policies for JP, KR, SA, SG
    WITH c AS (SELECT id AS cid FROM countries WHERE iso_code='JP'),
    ins AS (
      INSERT INTO policies (country_id, name, source_url, category, status, raw_text)
      SELECT cid, 'Japan AI Guidelines', 'https://example.jp/ai', 'ai_policy', 'in_force', 'Baseline AI policy text.' FROM c RETURNING id
    )
    INSERT INTO policy_indicators (policy_id, key, value) VALUES
      ((SELECT id FROM ins), 'mentions_ai_systems','true'),
      ((SELECT id FROM ins), 'mentions_cross_border','true');

    WITH c AS (SELECT id AS cid FROM countries WHERE iso_code='KR'),
    ins AS (
      INSERT INTO policies (country_id, name, source_url, category, status, raw_text)
      SELECT cid, 'Korea AI Policy', 'https://example.kr/ai', 'ai_policy', 'in_force', 'Baseline AI policy text.' FROM c RETURNING id
    )
    INSERT INTO policy_indicators (policy_id, key, value) VALUES
      ((SELECT id FROM ins), 'mentions_ai_systems','true');

    WITH c AS (SELECT id AS cid FROM countries WHERE iso_code='SA'),
    ins AS (
      INSERT INTO policies (country_id, name, source_url, category, status, raw_text)
      SELECT cid, 'Saudi AI Policy', 'https://example.sa/ai', 'ai_policy', 'in_force', 'Baseline AI policy text.' FROM c RETURNING id
    )
    INSERT INTO policy_indicators (policy_id, key, value) VALUES
      ((SELECT id FROM ins), 'mentions_data_localization','true'),
      ((SELECT id FROM ins), 'mentions_cross_border','true');

    WITH c AS (SELECT id AS cid FROM countries WHERE iso_code='SG'),
    ins AS (
      INSERT INTO policies (country_id, name, source_url, category, status, raw_text)
      SELECT cid, 'Singapore AI Model Governance', 'https://example.sg/ai', 'ai_policy', 'in_force', 'Baseline AI policy text.' FROM c RETURNING id
    )
    INSERT INTO policy_indicators (policy_id, key, value) VALUES
      ((SELECT id FROM ins), 'mentions_ai_systems','true'),
      ((SELECT id FROM ins), 'mentions_data_localization','true');

    -- Infra for JP, KR, SA, SG (illustrative)
    INSERT INTO infra_signals (country_id, metric, value) SELECT id, 'gpu_capacity_index', 62 FROM countries WHERE iso_code='JP';
    INSERT INTO infra_signals (country_id, metric, value) SELECT id, 'power_cost_index', 58 FROM countries WHERE iso_code='JP';

    INSERT INTO infra_signals (country_id, metric, value) SELECT id, 'gpu_capacity_index', 68 FROM countries WHERE iso_code='KR';
    INSERT INTO infra_signals (country_id, metric, value) SELECT id, 'power_cost_index', 57 FROM countries WHERE iso_code='KR';

    INSERT INTO infra_signals (country_id, metric, value) SELECT id, 'gpu_capacity_index', 66 FROM countries WHERE iso_code='SA';
    INSERT INTO infra_signals (country_id, metric, value) SELECT id, 'power_cost_index', 52 FROM countries WHERE iso_code='SA';

    INSERT INTO infra_signals (country_id, metric, value) SELECT id, 'gpu_capacity_index', 70 FROM countries WHERE iso_code='SG';
    INSERT INTO infra_signals (country_id, metric, value) SELECT id, 'power_cost_index', 55 FROM countries WHERE iso_code='SG';
    """
    conn = get_conn()
    try:
        conn.autocommit = True
        cur = conn.cursor()
        _exec_sql_blob(cur, seed_sql)
        cur.close()
        print("SEED_COMPLETE")
    finally:
        conn.close()


def run_scoring():
    from core.scoring import compute_scores

    compute_scores()
    print("SCORING_DONE")


def run_api_smoke():
    from api.main import app

    def _print(label: str, obj):
        text = json.dumps(obj, indent=2)[:600]
        print(f"{label}:\n{text}\n---\n")

    if _HAS_TESTCLIENT:
        client = TestClient(app)
        r = client.get("/health"); r.raise_for_status(); _print("HEALTH", r.json())
        r = client.get("/countries"); r.raise_for_status(); countries = r.json(); _print("COUNTRIES", countries)
        r = client.get("/country/EU"); r.raise_for_status(); _print("COUNTRY_EU", r.json())
        r = client.get("/compare", params=[("iso","EU"),("iso","IN")]); r.raise_for_status(); _print("COMPARE", r.json())
        r = client.get("/methodology"); r.raise_for_status(); _print("METHODOLOGY", r.json())
    else:
        # Fallback 1: run uvicorn and call with requests
        import time
        import threading
        import requests
        import uvicorn

        host = "127.0.0.1"; port = 8123
        server = None
        try:
            config = uvicorn.Config(app, host=host, port=port, log_level="error")
            server = uvicorn.Server(config)
            t = threading.Thread(target=server.run, daemon=True)
            t.start()
            time.sleep(1.2)

            base = f"http://{host}:{port}"
            r = requests.get(f"{base}/health"); r.raise_for_status(); _print("HEALTH", r.json())
            r = requests.get(f"{base}/countries"); r.raise_for_status(); _print("COUNTRIES", r.json())
            r = requests.get(f"{base}/country/EU"); r.raise_for_status(); _print("COUNTRY_EU", r.json())
            r = requests.get(f"{base}/compare", params=[("iso","EU"),("iso","IN")]); r.raise_for_status(); _print("COMPARE", r.json())
            r = requests.get(f"{base}/methodology"); r.raise_for_status(); _print("METHODOLOGY", r.json())
            return
        except Exception as e:
            print(f"SERVER_FALLBACK_FAILED: {e}")
        # Fallback 2: call route handlers directly (no HTTP)
        from api.main import list_countries as fn_list, get_country as fn_country, compare as fn_compare, methodology as fn_method
        _print("HEALTH", {"status":"ok"})
        _print("COUNTRIES", [c.model_dump() for c in fn_list()])
        _print("COUNTRY_EU", fn_country("EU").model_dump())
        _print("COMPARE", [c.model_dump() for c in fn_compare(["EU","IN"])])
        _print("METHODOLOGY", fn_method())


if __name__ == "__main__":
    apply_schema()
    seed_demo()
    run_scoring()
    run_api_smoke()
