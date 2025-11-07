# ingest/load_db.py

import os
import psycopg2
from fetch_sources import fetch_raw_policies
from parse_policies import extract_indicators

def get_conn():
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME", "sovai"),
        user=os.getenv("DB_USER", "sovai"),
        password=os.getenv("DB_PASSWORD", "sovai"),
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
    )

def upsert_country(cur, iso_code, name):
    cur.execute("""
        INSERT INTO countries (iso_code, name)
        VALUES (%s, %s)
        ON CONFLICT (iso_code) DO UPDATE SET name = EXCLUDED.name
        RETURNING id;
    """, (iso_code, name))
    return cur.fetchone()[0]

def insert_policy(cur, country_id, doc):
    cur.execute("""
        INSERT INTO policies (country_id, name, source_url, category, status, raw_text)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id;
    """, (country_id, doc["name"], doc["url"], doc["category"], "in_force", doc["raw_text"]))
    return cur.fetchone()[0]

def insert_indicators(cur, policy_id, indicators: dict):
    for k, v in indicators.items():
        cur.execute("""
            INSERT INTO policy_indicators (policy_id, key, value)
            VALUES (%s, %s, %s);
        """, (policy_id, k, str(v).lower()))

def main():
    docs = fetch_raw_policies()
    conn = get_conn()
    cur = conn.cursor()

    for d in docs:
        country_id = upsert_country(cur, d["iso_code"], d["country"])
        policy_id = insert_policy(cur, country_id, d)
        inds = extract_indicators(d["raw_text"])
        insert_indicators(cur, policy_id, inds)

    conn.commit()
    cur.close()
    conn.close()
    print(f"Loaded {len(docs)} policies into DB.")

if __name__ == "__main__":
    main()

