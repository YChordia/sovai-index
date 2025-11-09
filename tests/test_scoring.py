import math

from core import scoring as S


def test_policy_score_indicators():
    indicators = {
        "mentions_data_localization": True,
        "mentions_ai_systems": True,
        "mentions_cross_border": False,
    }
    score, flags = S._compute_policy_score({k: str(v).lower() for k, v in indicators.items()})
    assert flags["mentions_data_localization"] is True
    assert flags["mentions_ai_systems"] is True
    assert flags["mentions_cross_border"] is False
    # baseline 50 + 15 + 10 = 75
    assert math.isclose(score, 75.0)


def test_infra_score_defaults_and_adjustment():
    score, conf = S._compute_infra_score({})
    assert conf == "low" and math.isclose(score, 50.0)

    score2, conf2 = S._compute_infra_score({"gpu_capacity_index": 60, "power_cost_index": 70})
    # adjusted = 60 - (70-50)*0.1 = 60 - 2 = 58
    assert conf2 == "medium" and math.isclose(score2, 58.0)


def test_language_and_risk_simple():
    assert S._compute_language_score("EU") == 70.0
    assert S._compute_language_score("US") == 55.0

    risk = S._compute_risk_score(policy=80, infra=60, language=70)
    # composite = 0.4*80 + 0.3*60 + 0.2*70 = 32 + 18 + 14 = 64 -> risk = 36
    assert math.isclose(risk, 36.0)

