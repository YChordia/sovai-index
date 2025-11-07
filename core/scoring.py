# core/scoring.py

import os
import psycopg2
from datetime import datetime

def get_conn():
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME", "sovai"),
        user=os.getenv("DB_USER", "sovai"),
        password=os.getenv("DB_PASSWORD", "sovai"),
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
    )

def compute_scores():
    conn = get_conn()
    cur = conn.cursor()

    # Very naive example just to demonstrate mechanics:
    # You’ll replace with weighted model (policy × infra × risk).
    cur.execute("""
        SELECT c.id, c.iso_code, c.name
        FROM countries c;
    """)
    countries = cur.fetchall()

    for cid, iso, name in countries:
        # policy features
        cur.execute("""
            SELECT key, value FROM policy_indicators
            JOIN policies p ON p.id = policy_indicators.policy_id
            WHERE p.country_id = %s;
        """, (cid,))
        inds = cur.fetchall()
        inds_dict = {k: v for (k, v) in inds}

        # infra signals (placeholder)
        cur.execute("""
            SELECT metric, value FROM infra_signals
            WHERE country_id = %s;
        """, (cid,))
        infra = {m: float(v) for (m, v) in cur.fetchall()} if cur.rowcount else {}

        # toy scoring logic
        policy_score = 50.0
        if inds_dict.get("ai_registry_required") == "true":
            policy_score += 10
        if inds_dict.get("data_residency_required") == "true":
            policy_score += 5

        infra_score = infra.get("gpu_capacity_index", 40.0)
        risk_score = 100.0 - policy_score * 0.3  # placeholder

        total = 0.5 * policy_score + 0.4 * infra_score - 0.1 * risk_score

        cur.execute("""
            INSERT INTO readiness_scores (country_id, score, policy_score, infra_score, risk_score, computed_at)
            VALUES (%s, %s, %s, %s, %s, %s);
        """, (cid, total, policy_score, infra_score, risk_score, datetime.utcnow()))

        print(f"[{iso}] {name}: readiness={total:.1f}")

    conn.commit()
    cur.close()
    conn.close()

if __name__ == "__main__":
    compute_scores()
