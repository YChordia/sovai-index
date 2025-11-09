"""SovAI Index API (FastAPI)

Endpoints provide transparent, structured data for the frontend and demo.
"""

import os
from typing import List, Optional

import psycopg2
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="SovAI Index API", version="0.2")

# Allow local dev frontend to call API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_conn():
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME", "sovai"),
        user=os.getenv("DB_USER", "sovai"),
        password=os.getenv("DB_PASSWORD", "sovai"),
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
    )


# ---------- Pydantic Models ----------

class CountrySummary(BaseModel):
    """High-level rollup used on overview and compare views."""

    iso_code: str
    name: str
    readiness_score: Optional[float] = None
    policy_score: Optional[float] = None
    infra_score: Optional[float] = None
    language_score: Optional[float] = None
    risk_score: Optional[float] = None


class PolicyIndicator(BaseModel):
    policy_name: str
    key: str
    value: str
    source_url: Optional[str] = None


class Policy(BaseModel):
    id: int
    name: str
    source_url: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    indicators: List[PolicyIndicator] = []


class CountryDetail(BaseModel):
    """Detail view with components and provenance."""

    iso_code: str
    name: str
    readiness_score: Optional[float] = None
    policy_score: Optional[float] = None
    infra_score: Optional[float] = None
    language_score: Optional[float] = None
    risk_score: Optional[float] = None
    computed_at: Optional[str] = None
    policies: List[Policy] = []
    methodology: dict


# ---------- Routes ----------


@app.get("/health")
def health():
    """Simple health check."""
    return {"status": "ok"}


@app.get("/countries", response_model=List[CountrySummary])
def list_countries():
    """List countries with latest scores for overview table."""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT c.iso_code,
               c.name,
               rs.score,
               rs.policy_score,
               rs.infra_score,
               rs.language_score,
               rs.risk_score
        FROM countries c
        LEFT JOIN LATERAL (
            SELECT r.score, r.policy_score, r.infra_score, r.language_score, r.risk_score
            FROM readiness_scores r
            WHERE r.country_id = c.id
            ORDER BY r.computed_at DESC
            LIMIT 1
        ) rs ON true
        ORDER BY c.name;
        """
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        CountrySummary(
            iso_code=iso,
            name=name,
            readiness_score=float(score) if score is not None else None,
            policy_score=float(ps) if ps is not None else None,
            infra_score=float(iscore) if iscore is not None else None,
            language_score=float(ls) if ls is not None else None,
            risk_score=float(rs) if rs is not None else None,
        )
        for (iso, name, score, ps, iscore, ls, rs) in rows
    ]


@app.get("/country/{iso_code}", response_model=CountryDetail)
def get_country(iso_code: str):
    """Country details including provenance of key indicators."""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT c.id, c.name
        FROM countries c
        WHERE c.iso_code = %s;
        """,
        (iso_code.upper(),),
    )
    row = cur.fetchone()
    if not row:
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Country not found")
    cid, name = row

    cur.execute(
        """
        SELECT score, policy_score, infra_score, language_score, risk_score, computed_at
        FROM readiness_scores
        WHERE country_id = %s
        ORDER BY computed_at DESC
        LIMIT 1;
        """,
        (cid,),
    )
    score_row = cur.fetchone()

    # Fetch policies
    cur.execute(
        """
        SELECT id, name, source_url, category, status
        FROM policies
        WHERE country_id = %s
        ORDER BY name;
        """,
        (cid,),
    )
    policies_rows = cur.fetchall()

    policies: List[Policy] = []
    for (pid, pname, psrc, pcat, pstat) in policies_rows:
        cur.execute(
            """
            SELECT pi.key, pi.value, p.source_url
            FROM policy_indicators pi
            JOIN policies p ON p.id = pi.policy_id
            WHERE pi.policy_id = %s
            ORDER BY pi.key;
            """,
            (pid,),
        )
        inds = [
            PolicyIndicator(policy_name=pname, key=k, value=str(v), source_url=src)
            for (k, v, src) in cur.fetchall()
        ]
        policies.append(
            Policy(
                id=pid,
                name=pname,
                source_url=psrc,
                category=pcat,
                status=pstat,
                indicators=inds,
            )
        )

    cur.close()
    conn.close()

    methodology = methodology_spec()
    return CountryDetail(
        iso_code=iso_code.upper(),
        name=name,
        readiness_score=float(score_row[0]) if score_row else None,
        policy_score=float(score_row[1]) if score_row else None,
        infra_score=float(score_row[2]) if score_row else None,
        language_score=float(score_row[3]) if score_row else None,
        risk_score=float(score_row[4]) if score_row else None,
        computed_at=score_row[5].isoformat() if score_row else None,
        policies=policies,
        methodology=methodology,
    )


@app.get("/compare", response_model=List[CountrySummary])
def compare(iso: List[str] = Query(default=[])):
    """Compare multiple countries by ISO codes."""
    if not iso:
        return []
    codes = [i.upper() for i in iso]
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT c.iso_code,
               c.name,
               rs.score,
               rs.policy_score,
               rs.infra_score,
               rs.language_score,
               rs.risk_score
        FROM countries c
        LEFT JOIN LATERAL (
            SELECT r.score, r.policy_score, r.infra_score, r.language_score, r.risk_score
            FROM readiness_scores r
            WHERE r.country_id = c.id
            ORDER BY r.computed_at DESC
            LIMIT 1
        ) rs ON true
        WHERE c.iso_code = ANY(%s)
        ORDER BY c.name;
        """,
        (codes,),
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        CountrySummary(
            iso_code=iso,
            name=name,
            readiness_score=float(score) if score is not None else None,
            policy_score=float(ps) if ps is not None else None,
            infra_score=float(iscore) if iscore is not None else None,
            language_score=float(ls) if ls is not None else None,
            risk_score=float(rs) if rs is not None else None,
        )
        for (iso, name, score, ps, iscore, ls, rs) in rows
    ]


def methodology_spec() -> dict:
    """Static but structured methodology for frontend transparency."""
    return {
        "inputs": [
            "policy_indicators (mentions_* flags from parsed texts)",
            "infra_signals (gpu_capacity_index, power_cost_index)",
            "language_signals (placeholder by ISO)",
        ],
        "weights": {
            "policy": 0.4,
            "infra": 0.3,
            "language": 0.2,
            "risk_penalty": 0.1,
        },
        "equations": {
            "readiness": "0.4*policy + 0.3*infra + 0.2*language - 0.1*risk",
            "risk": "100 - (0.4*policy + 0.3*infra + 0.2*language)",
        },
        "notes": [
            "Infra defaults to 50 when missing (low confidence).",
            "Language score is a placeholder until connected to real signals.",
            "Policy score increases with explicit mentions (localization, AI systems, cross-border).",
        ],
    }


@app.get("/methodology")
def methodology():
    """Return methodology specification for transparency UI."""
    return methodology_spec()


@app.get("/")
def root():
    """Friendly root message so hitting / is informative, not 404."""
    return {
        "message": "SovAI Index API",
        "try": [
            "/health",
            "/countries",
            "/country/EU",
            "/compare?iso=EU&iso=IN",
            "/methodology",
            "/docs",
        ],
    }
