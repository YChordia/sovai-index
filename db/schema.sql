CREATE TABLE IF NOT EXISTS countries (id SERIAL PRIMARY KEY, iso_code VARCHAR(3) UNIQUE, name TEXT);
CREATE TABLE IF NOT EXISTS policies (id SERIAL PRIMARY KEY, country_id INT, name TEXT, source_url TEXT, category TEXT, raw_text TEXT);
CREATE TABLE IF NOT EXISTS readiness_scores (id SERIAL PRIMARY KEY, country_id INT, score NUMERIC, computed_at TIMESTAMP DEFAULT now());
