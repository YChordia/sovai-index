# ingest/fetch_sources.py

import requests

SOURCES = [
    {
        "country": "EU",
        "iso_code": "EU",
        "name": "EU AI Act (consolidated text)",
        "url": "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689",
        "category": "ai_act",
    },
    {
        "country": "India",
        "iso_code": "IN",
        "name": "Digital Personal Data Protection Act 2023",
        "url": "https://www.meity.gov.in/data-protection-framework",
        "category": "data_protection",
    },
]

def fetch_raw_policies():
    docs = []
    for s in SOURCES:
        try:
            resp = requests.get(s["url"], timeout=20)
            if resp.ok:
                # For MVP we just store first chunk of HTML/text
                raw = resp.text
                docs.append(
                    {
                        "country": s["country"],
                        "iso_code": s["iso_code"],
                        "name": s["name"],
                        "url": s["url"],
                        "category": s["category"],
                        "raw_text": raw[:200000],
                    }
                )
                print(f"Fetched: {s['name']}")
            else:
                print(f"Failed {s['name']}: HTTP {resp.status_code}")
        except Exception as e:
            print(f"Error fetching {s['name']}: {e}")
    return docs

if __name__ == "__main__":
    policies = fetch_raw_policies()
    print(f"Total fetched: {len(policies)}")
