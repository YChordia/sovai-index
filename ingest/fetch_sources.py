# ingest/fetch_sources.py

import requests

SOURCES = [
    {
        "country": "EU",
        "iso_code": "EU",
        "name": "EU AI Act",
        "url": "https://eur-lex.europa.eu/eli/reg/2024/ai/oj",  # example
        "category": "ai_act"
    },
    # Add India, KSA, etc gradually
]

def fetch_raw_policies():
    docs = []
    for s in SOURCES:
        try:
            resp = requests.get(s["url"], timeout=15)
            if resp.ok:
                docs.append({
                    "country": s["country"],
                    "iso_code": s["iso_code"],
                    "name": s["name"],
                    "url": s["url"],
                    "category": s["category"],
                    "raw_text": resp.text[:200000]  # truncate for MVP
                })
        except Exception as e:
            print(f"Error fetching {s['url']}: {e}")
    return docs

if __name__ == "__main__":
    policies = fetch_raw_policies()
    print(f"Fetched {len(policies)} policies.")
