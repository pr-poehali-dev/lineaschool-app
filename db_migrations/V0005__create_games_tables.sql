-- Создание таблицы для хранения игр
CREATE TABLE IF NOT EXISTS t_p720035_lineaschool_app.games (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    game_type VARCHAR(50) NOT NULL,
    difficulty VARCHAR(20) DEFAULT 'medium',
    target_age_min INTEGER,
    target_age_max INTEGER,
    image_url TEXT,
    config JSONB NOT NULL,
    created_by INTEGER REFERENCES t_p720035_lineaschool_app.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    plays_count INTEGER DEFAULT 0,
    average_score DECIMAL(5,2)
);

-- Индексы для быстрого поиска
CREATE INDEX idx_games_type ON t_p720035_lineaschool_app.games(game_type);
CREATE INDEX idx_games_difficulty ON t_p720035_lineaschool_app.games(difficulty);
CREATE INDEX idx_games_created_by ON t_p720035_lineaschool_app.games(created_by);
CREATE INDEX idx_games_active ON t_p720035_lineaschool_app.games(is_active);

-- Таблица для результатов игр
CREATE TABLE IF NOT EXISTS t_p720035_lineaschool_app.game_results (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES t_p720035_lineaschool_app.games(id),
    student_id INTEGER REFERENCES t_p720035_lineaschool_app.users(id),
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    time_spent INTEGER,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details JSONB
);

-- Индексы для результатов
CREATE INDEX idx_game_results_game ON t_p720035_lineaschool_app.game_results(game_id);
CREATE INDEX idx_game_results_student ON t_p720035_lineaschool_app.game_results(student_id);
CREATE INDEX idx_game_results_completed ON t_p720035_lineaschool_app.game_results(completed_at);