# ingest/parse_policies.py

import re

def extract_indicators(raw_text: str) -> dict:
    text = raw_text.lower()
    return {
        "data_residency_required": "data localization" in text or "data localisation" in text,
        "ai_registry_required": "ai system registry" in text or "registration of high-risk ai" in text,
        "cross_border_restrictions": "cross-border data transfer" in text or "third country" in text,
    }

