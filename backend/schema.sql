-- backend/schema.sql

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    level INTEGER DEFAULT 1,
    current_exp INTEGER DEFAULT 0,
    max_exp INTEGER DEFAULT 100,
    hp INTEGER DEFAULT 100,
    max_hp INTEGER DEFAULT 100,
    fatigue INTEGER DEFAULT 0,
    str NUMERIC DEFAULT 10,
    vit NUMERIC DEFAULT 10,
    agi NUMERIC DEFAULT 10,
    int_stat NUMERIC DEFAULT 10, -- 'int' is a reserved keyword
    prs NUMERIC DEFAULT 10,
    last_login DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(10) CHECK (type IN ('STR', 'VIT', 'AGI', 'INT', 'PRS')),
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    date DATE DEFAULT CURRENT_DATE,
    completed_count INTEGER,
    total_count INTEGER
);

-- Insert a default user
INSERT INTO users (username) VALUES ('Player1') ON CONFLICT DO NOTHING;