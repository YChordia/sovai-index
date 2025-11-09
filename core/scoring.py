"""
Sovereign AI Readiness Scoring
--------------------------------

Transparent, easily readable scoring for SovAI Index stakeholders.

Components and weights:
  - policy_score   (weight 0.4)
  - infra_score    (weight 0.3)
  - language_score (weight 0.2)
  - risk_score     (penalty 0.1)

Readiness score formula:
  readiness = 0.4*policy + 0.3*infra + 0.2*language - 0.1*risk

Notes:
  - policy_score is derived from parsed policy_indicators. We prefer
    explicit “mentions_*” booleans but also accept legacy keys.
  - infra_score is stubbed; if no infra_signals are present, we use a
    neutral default (50) and treat confidence as low (documented only).
  - language_score is a placeholder tied to ISO code until richer data
    is wired in (e.g., local LLM availability, open-source activity).
  - risk_score is a simple inverse heuristic of the other components.
"""

import os
from datetime import datetime
from typing import Dict, Tuple

import psycopg2


def get_conn():
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME", "sovai"),
        user=os.getenv("DB_USER", "sovai"),
        password=os.getenv("DB_PASSWORD", "sovai"),
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
    )


def _bool(val: str) -> bool:
    """Convert common text representations to boolean."""
    if val is None:
        return False
    v = str(val).strip().lower()
    return v in {"1", "true", "yes", "y"}


def _compute_policy_score(indicators: Dict[str, str]) -> Tuple[float, Dict[str, bool]]:
    """Compute a transparent policy score from indicator flags.

    We recognize both normalized keys and legacy keys from earlier parsers.

    Signal mapping (booleans):
      - mentions_data_localization  | legacy: data_residency_required
      - mentions_ai_systems         | legacy: ai_registry_required
      - mentions_cross_border       | legacy: cross_border_restrictions

    Scoring (bounded 0..100):
      baseline = 50
      +15 if mentions_data_localization
      +10 if mentions_ai_systems
      + 5 if mentions_cross_border
    """
    flags = {
        "mentions_data_localization": _bool(
            indicators.get("mentions_data_localization")
            or indicators.get("data_residency_required")
        ),
        "mentions_ai_systems": _bool(
            indicators.get("mentions_ai_systems") or indicators.get("ai_registry_required")
        ),
        "mentions_cross_border": _bool(
            indicators.get("mentions_cross_border")
            or indicators.get("cross_border_restrictions")
        ),
    }

    score = 50.0
    if flags["mentions_data_localization"]:
        score += 15
    if flags["mentions_ai_systems"]:
        score += 10
    if flags["mentions_cross_border"]:
        score += 5
    score = max(0.0, min(100.0, score))
    return score, flags


def _compute_infra_score(infra: Dict[str, float]) -> Tuple[float, str]:
    """Compute infra score from infra_signals.

    For MVP we accept a few optional metrics:
      - gpu_capacity_index (0..100)
      - power_cost_index   (0..100) invert effect lightly

    If absent, return neutral 50 with low confidence.
    """
    if not infra:
        return 50.0, "low"

    base = float(infra.get("gpu_capacity_index", 50.0))
    power_cost_index = float(infra.get("power_cost_index", 50.0))
    # Higher power cost reduces infra viability slightly
    adjusted = base - (power_cost_index - 50.0) * 0.1
    adjusted = max(0.0, min(100.0, adjusted))
    return adjusted, "medium"


def _compute_language_score(iso_code: str) -> float:
    """Placeholder language/knowledge sovereignty score by ISO code.

    Until real signals arrive (e.g., presence of local LLM models, open-source
    AI ecosystem, language resources), bias a bit towards regions with active
    sovereign AI discourse to make demos meaningful.
    """
    high = {"IN", "EU"}
    if iso_code.upper() in high:
        return 70.0
    return 55.0


def _compute_risk_score(policy: float, infra: float, language: float) -> float:
    """Simple inverse heuristic of the composite components.

    Maps higher component scores to lower risk. Bounded 0..100.
    """
    composite = 0.4 * policy + 0.3 * infra + 0.2 * language
    risk = 100.0 - composite
    return max(0.0, min(100.0, risk))


def compute_scores():
    """Compute and persist readiness scores for all countries.

    Writes to readiness_scores with a timestamp, preserving history.
    """
    conn = get_conn()
    cur = conn.cursor()

    # Fetch countries
    cur.execute(
        """
        SELECT c.id, c.iso_code, c.name
        FROM countries c;
        """
    )
    countries = cur.fetchall()

    for cid, iso, name in countries:
        # Gather policy indicators for the country
        cur.execute(
            """
            SELECT pi.key, pi.value
            FROM policy_indicators pi
            JOIN policies p ON p.id = pi.policy_id
            WHERE p.country_id = %s;
            """,
            (cid,),
        )
        indicators = {k: v for (k, v) in cur.fetchall()}

        # Gather infra signals
        cur.execute(
            """
            SELECT metric, value
            FROM infra_signals
            WHERE country_id = %s;
            """,
            (cid,),
        )
        infra = {m: float(v) for (m, v) in cur.fetchall()} if cur.rowcount else {}

        # Compute component scores
        policy_score, _ = _compute_policy_score(indicators)
        infra_score, _confidence = _compute_infra_score(infra)
        language_score = _compute_language_score(iso)
        risk_score = _compute_risk_score(policy_score, infra_score, language_score)

        readiness = 0.4 * policy_score + 0.3 * infra_score + 0.2 * language_score - 0.1 * risk_score

        # Persist snapshot
        cur.execute(
            """
            INSERT INTO readiness_scores (
                country_id, score, policy_score, infra_score, language_score, risk_score, computed_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s);
            """,
            (cid, readiness, policy_score, infra_score, language_score, risk_score, datetime.utcnow()),
        )

        print(
            f"[{iso}] {name}: readiness={readiness:.1f} "
            f"(policy={policy_score:.1f}, infra={infra_score:.1f}, language={language_score:.1f}, risk={risk_score:.1f})"
        )

    conn.commit()
    cur.close()
    conn.close()


if __name__ == "__main__":
    compute_scores()

