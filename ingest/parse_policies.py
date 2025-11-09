# ingest/parse_policies.py

import re


def extract_indicators(raw_text: str) -> dict:
    """Extract simple, explainable indicators from raw policy text.

    We emit both normalized keys used by scoring and legacy keys to keep
    backward compatibility with existing data.
    """
    text = raw_text.lower()
    mentions_data_localization = (
        "data localization" in text or "data localisation" in text or "data residency" in text
    )
    mentions_ai_systems = (
        "ai system" in text or "high-risk ai" in text or "ai registry" in text
    )
    mentions_cross_border = (
        "cross-border data transfer" in text or "third country" in text or "cross border" in text
    )

    return {
        # Normalized flags
        "mentions_data_localization": mentions_data_localization,
        "mentions_ai_systems": mentions_ai_systems,
        "mentions_cross_border": mentions_cross_border,
        # Legacy equivalents preserved for safety
        "data_residency_required": mentions_data_localization,
        "ai_registry_required": mentions_ai_systems,
        "cross_border_restrictions": mentions_cross_border,
    }
