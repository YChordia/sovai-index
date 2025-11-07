# api/main.py

from fastapi import FastAPI
import os
import psycopg2
from typing import List

app = FastAPI(title="SovAI Index API", version="0.1")

def get_conn():
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME", "sovai"),
        user=os.getenv("DB_USER", "sovai"),
        password=os.getenv("DB_PASSWORD", "sovai"),
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
    )

@app.get("/countries")
def list_countries():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT c.iso_code, c.name,
               (SELECT score FROM readiness_scores rs
                WHERE rs.country_id = c.id
                ORDER BY computed_at DESC
                LIMIT 1) AS latest_score
        FROM countries c
        ORDER BY c.name;
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {"iso_code": iso, "name": name, "readiness_score": float(score) if score is not None else None}
        for iso, name, score in rows
    ]

@app.get("/country/{iso_code}")
def get_country(iso_code: str):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT c.id, c.name
        FROM countries c
        WHERE c.iso_code = %s;
    """, (iso_code.upper(),))
    row = cur.fetchone()
    if not row:
        return {"error": "Not found"}
    cid, name = row

    cur.execute("""
        SELECT score, policy_score, infra_score, risk_score, computed_at
        FROM readiness_scores
        WHERE country_id = %s
        ORDER BY computed_at DESC
        LIMIT 1;
    """, (cid,))
    score_row = cur.fetchone()

    cur.execute("""
        SELECT p.name, pi.key, pi.value
        FROM policies p
        JOIN policy_indicators pi ON pi.policy_id = p.id
        WHERE p.country_id = %s;
    """, (cid,))
    indicators = [
        {"policy": p, "key": k, "value": v}
        for (p, k, v) in cur.fetchall()
    ]

    cur.close()
    conn.close()

    return {
        "iso_code": iso_code.upper(),
        "name": name,
        "readiness": {
            "score": float(score_row[0]) if score_row else None,
            "policy_score": float(score_row[1]) if score_row else None,
            "infra_score": float(score_row[2]) if score_row else None,
            "risk_score": float(score_row[3]) if score_row else None,
            "computed_at": score_row[4].isoformat() if score_row else None,
        } if score_row else {},
        "indicators": indicators,
    }
