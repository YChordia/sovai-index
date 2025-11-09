CREATE TABLE IF NOT EXISTS countries (
    id SERIAL PRIMARY KEY,
    iso_code VARCHAR(3) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    region TEXT
);

CREATE TABLE IF NOT EXISTS policies (
    id SERIAL PRIMARY KEY,
    country_id INT NOT NULL REFERENCES countries(id),
    name TEXT NOT NULL,
    source_url TEXT,
    category TEXT,                -- e.g. "data_protection", "ai_act", "localization"
    status TEXT,                  -- e.g. "draft", "in_force", "proposed"
    last_updated DATE,
    raw_text TEXT
);

CREATE TABLE IF NOT EXISTS policy_indicators (
    id SERIAL PRIMARY KEY,
    policy_id INT NOT NULL REFERENCES policies(id),
    key TEXT NOT NULL,            -- e.g. "data_residency_required"
    value TEXT NOT NULL           -- store as text/JSON; interpret in code
);

CREATE TABLE IF NOT EXISTS infra_signals (
    id SERIAL PRIMARY KEY,
    country_id INT NOT NULL REFERENCES countries(id),
    metric TEXT NOT NULL,         -- e.g. "gpu_capacity_index", "power_cost_index"
    value NUMERIC,
    as_of DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS readiness_scores (
    id SERIAL PRIMARY KEY,
    country_id INT NOT NULL REFERENCES countries(id),
    score NUMERIC NOT NULL,
    policy_score NUMERIC,
    infra_score NUMERIC,
    language_score NUMERIC,
    risk_score NUMERIC,
    computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
