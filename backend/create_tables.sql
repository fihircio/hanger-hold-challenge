-- Players table
CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Scores table
CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    time INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players (id)
);

-- Prizes table
CREATE TABLE IF NOT EXISTS prizes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    message TEXT,
    slot INTEGER NOT NULL,
    time_threshold INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Vending logs table
CREATE TABLE IF NOT EXISTS vending_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    score_id INTEGER NOT NULL,
    prize_id INTEGER,
    command TEXT,
    response TEXT,
    success INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (score_id) REFERENCES scores (id),
    FOREIGN KEY (prize_id) REFERENCES prizes (id)
);

-- Insert sample prizes
INSERT OR IGNORE INTO prizes (id, name, message, slot, time_threshold) VALUES
(1, 'Bronze Prize', 'Congratulations! You won a bronze prize!', 1, 5000),
(2, 'Silver Prize', 'Great job! You won a silver prize!', 2, 10000),
(3, 'Gold Prize', 'Amazing! You won a gold prize!', 3, 20000),
(4, 'Platinum Prize', 'Incredible! You won a platinum prize!', 4, 30000);