# Database Schema

## Overview

The Hanger Hold Challenge system uses a MySQL database with a structured schema designed for game management, scoring, and vending operations.

## Database Configuration

### Connection Settings
```ini
[client]
default-character-set = utf8mb4

[mysql]
default-storage-engine = InnoDB
innodb-buffer-pool-size = 256M
innodb-log-file-size = 256M
innodb-flush-log-at-trx-commit = 1
innodb-flush-method = O_DIRECT
```

## Table Structure

### 1. Players Table

Stores user information and player profiles.

```sql
CREATE TABLE `players` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL COMMENT 'Player name',
  `email` VARCHAR(255) NULL COMMENT 'Player email address',
  `phone` VARCHAR(20) NULL COMMENT 'Player phone number',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Account creation timestamp',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. Scores Table

Records game results and timing information.

```sql
CREATE TABLE `scores` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `player_id` INT NOT NULL COMMENT 'Reference to players table',
  `time` INT NOT NULL COMMENT 'Game duration in milliseconds',
  `prize_id` INT NULL COMMENT 'Associated prize ID',
  `dispensed` BOOLEAN DEFAULT FALSE COMMENT 'Whether prize was dispensed',
  `dispensed_at` TIMESTAMP NULL COMMENT 'When prize was dispensed',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Score submission timestamp',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  
  INDEX `idx_scores_time` (`time`),
  INDEX `idx_scores_player_id` (`player_id`),
  INDEX `idx_scores_created_at` (`created_at`),
  
  FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. Prizes Table

Defines prize tiers and configurations.

```sql
CREATE TABLE `prizes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL COMMENT 'Prize display name',
  `message` VARCHAR(255) NOT NULL COMMENT 'Success message to player',
  `slot` INT NOT NULL COMMENT 'Physical vending slot number',
  `time_threshold` INT NOT NULL COMMENT 'Minimum time in milliseconds',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Prize creation timestamp',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4. Vending Logs Table

Records all vending operations and results.

```sql
CREATE TABLE `vending_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `score_id` INT NULL COMMENT 'Associated score ID',
  `prize_id` INT NULL COMMENT 'Associated prize ID',
  `prize_name` VARCHAR(255) NULL COMMENT 'Prize display name',
  `player_name` VARCHAR(255) NULL COMMENT 'Player name (from join)',
  `slot` INT NULL COMMENT 'Vending slot used',
  `command` VARCHAR(50) NULL COMMENT 'Hex command sent',
  `response` VARCHAR(50) NULL COMMENT 'Hardware response',
  `success` BOOLEAN DEFAULT FALSE COMMENT 'Operation success status',
  `error_message` TEXT NULL COMMENT 'Error description if failed',
  `spring_channel` INT NULL COMMENT 'Channel used by Spring SDK',
  `spring_error_code` INT NULL COMMENT 'Spring SDK error code',
  `spring_error_message` VARCHAR(255) NULL COMMENT 'Spring SDK error description',
  `spring_tier` VARCHAR(20) NULL COMMENT 'Prize tier (gold/silver/bronze)',
  `spring_success` BOOLEAN DEFAULT FALSE COMMENT 'Spring SDK dispensing success status',
  `source` VARCHAR(20) DEFAULT 'legacy' COMMENT 'Dispensing source (legacy/spring_sdk)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Log creation timestamp'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 5. Spring Vending Logs Table

Detailed Spring SDK operation tracking.

```sql
CREATE TABLE `spring_vending_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Log timestamp',
  `action` VARCHAR(50) NOT NULL COMMENT 'Action type (dispensing_attempt, dispensing_success, etc.)',
  `tier` VARCHAR(20) NULL COMMENT 'Prize tier',
  `channel` INT NULL COMMENT 'Channel number',
  `score_id` INT NULL COMMENT 'Related score ID',
  `success` BOOLEAN DEFAULT FALSE COMMENT 'Action success status',
  `error_code` INT NULL COMMENT 'Spring SDK error code',
  `error_message` TEXT NULL COMMENT 'Error description',
  `source` VARCHAR(20) DEFAULT 'spring_sdk' COMMENT 'Log source',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Log creation timestamp'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Indexes

### Performance Indexes

```sql
-- Scores table indexes
CREATE INDEX `idx_scores_time` ON `scores`(`time`);
CREATE INDEX `idx_scores_player_id` ON `scores`(`player_id`);
CREATE INDEX `idx_scores_created_at` ON `scores`(`created_at`);

-- Vending logs indexes
CREATE INDEX `idx_vending_logs_created_at` ON `vending_logs`(`created_at`);
CREATE INDEX `idx_vending_logs_score_id` ON `vending_logs`(`score_id`);
CREATE INDEX `idx_vending_logs_success` ON `vending_logs`(`success`);
CREATE INDEX `idx_vending_logs_source` ON `vending_logs`(`source`);

-- Spring vending logs indexes
CREATE INDEX `idx_spring_vending_logs_timestamp` ON `spring_vending_logs`(`timestamp`);
CREATE INDEX `idx_spring_vending_logs_action` ON `spring_vending_logs`(`action`);
CREATE INDEX `idx_spring_vending_logs_success` ON `spring_vending_logs`(`success`);
CREATE INDEX `idx_spring_vending_logs_score_id` ON `spring_vending_logs`(`score_id`);
```

## Data Relationships

### Entity Relationship Diagram

```
players (1) ←→ (many) scores (many)
   ↓                    ↓
   player_id            score_id
   ↓                    ↓
   id                    id
   ↓                    ↓
   prize_id             prize_id
   ↓                    ↓
   id                    id

scores (many) ←→ (many) vending_logs (many)
   ↓                    ↓
   id                    score_id
   ↓                    ↓
   id                    id
```

## Initial Data

### Default Prizes

```sql
INSERT INTO `prizes` (`id`, `name`, `message`, `slot`, `time_threshold`) VALUES
(1, 'Gold Prize', 'Excellent!', 3, 60000),
(2, 'Silver Prize', 'Great job!', 10, 30000),
(3, 'Bronze Prize', 'Good effort!', 20, 10000);
```

### Time-to-Tier Mapping

```sql
-- Time thresholds in milliseconds
Gold:   ≥ 60000 (60 seconds)
Silver:  ≥ 30000 (30 seconds) AND < 60000
Bronze:  ≥ 10000 (10 seconds) AND < 30000
None:   < 10000
```

## Database Migration

### Migration Files

#### 001_create_players_table.sql
```sql
CREATE TABLE `players` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NULL,
  `phone` VARCHAR(20) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 002_create_scores_table.sql
```sql
CREATE TABLE `scores` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `player_id` INT NOT NULL,
  `time` INT NOT NULL,
  `prize_id` INT NULL,
  `dispensed` BOOLEAN DEFAULT FALSE,
  `dispensed_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 003_create_prizes_table.sql
```sql
CREATE TABLE `prizes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `message` VARCHAR(255) NOT NULL,
  `slot` INT NOT NULL,
  `time_threshold` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 004_create_vending_logs_table.sql
```sql
CREATE TABLE `vending_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `score_id` INT NULL,
  `prize_id` INT NULL,
  `prize_name` VARCHAR(255) NULL,
  `player_name` VARCHAR(255) NULL,
  `slot` INT NULL,
  `command` VARCHAR(50) NULL,
  `response` VARCHAR(50) NULL,
  `success` BOOLEAN DEFAULT FALSE,
  `error_message` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 005_seed_prizes_table.sql
```sql
INSERT INTO `prizes` (`id`, `name`, `message`, `slot`, `time_threshold`) VALUES
(1, 'Gold Prize', 'Excellent!', 3, 60000),
(2, 'Silver Prize', 'Great job!', 10, 30000),
(3, 'Bronze Prize', 'Good effort!', 20, 10000);
```

#### 006_add_spring_vending_columns.sql
```sql
-- Add Spring SDK columns to vending_logs
ALTER TABLE `vending_logs` 
ADD COLUMN `spring_channel` INT NULL COMMENT 'Channel used by Spring SDK',
ADD COLUMN `spring_error_code` INT NULL COMMENT 'Spring SDK error code',
ADD COLUMN `spring_error_message` VARCHAR(255) NULL COMMENT 'Spring SDK error description',
ADD COLUMN `spring_tier` VARCHAR(20) NULL COMMENT 'Prize tier (gold/silver/bronze)',
ADD COLUMN `spring_success` BOOLEAN DEFAULT FALSE COMMENT 'Spring SDK dispensing success status',
ADD COLUMN `source` VARCHAR(20) DEFAULT 'legacy' COMMENT 'Dispensing source (legacy/spring_sdk)';

-- Create spring_vending_logs table
CREATE TABLE `spring_vending_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `action` VARCHAR(50) NOT NULL,
  `tier` VARCHAR(20) NULL,
  `channel` INT NULL,
  `score_id` INT NULL,
  `success` BOOLEAN DEFAULT FALSE,
  `error_code` INT NULL,
  `error_message` TEXT NULL,
  `source` VARCHAR(20) DEFAULT 'spring_sdk',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Query Examples

### Common Queries

#### Get Top Players by Score
```sql
SELECT p.name, MAX(s.time) as best_time
FROM players p
JOIN scores s ON p.id = s.player_id
GROUP BY p.id
ORDER BY best_time DESC
LIMIT 10;
```

#### Get Recent Vending Activity
```sql
SELECT vl.*, p.name as player_name, pr.name as prize_name
FROM vending_logs vl
LEFT JOIN scores s ON vl.score_id = s.id
LEFT JOIN players p ON s.player_id = p.id
LEFT JOIN prizes pr ON vl.prize_id = pr.id
ORDER BY vl.created_at DESC
LIMIT 20;
```

#### Get System Statistics
```sql
SELECT 
  COUNT(DISTINCT player_id) as total_players,
  COUNT(*) as total_scores,
  AVG(time) as average_score,
  MAX(time) as best_score
FROM scores;
```

#### Get Spring SDK Performance
```sql
SELECT 
  COUNT(*) as total_operations,
  SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_operations,
  SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed_operations,
  AVG(CASE WHEN success = 1 THEN 1 ELSE 0 END) * 100 as success_rate
FROM spring_vending_logs
WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY);
```

## Performance Optimization

### Query Optimization

#### Use Indexes Effectively
```sql
-- Good: Uses index on player_id
SELECT * FROM scores WHERE player_id = 123;

-- Bad: Full table scan
SELECT * FROM scores WHERE name LIKE '%john%';
```

#### Avoid N+1 Query Problem
```sql
-- Bad: Multiple queries for each player
SELECT * FROM scores WHERE player_id = 1;
SELECT * FROM scores WHERE player_id = 2;
SELECT * FROM scores WHERE player_id = 3;

-- Good: Single query with IN clause
SELECT * FROM scores WHERE player_id IN (1, 2, 3);
```

#### Use Proper JOINs
```sql
-- Avoid SELECT in WHERE clause
SELECT s.*, p.name FROM scores s
JOIN players p ON s.player_id = p.id
WHERE s.time > 30000;

-- Instead of:
SELECT s.*, (SELECT name FROM players WHERE id = s.player_id) as player_name
FROM scores s
WHERE s.time > 30000;
```

### Database Maintenance

#### Regular Maintenance Queries
```sql
-- Clean old logs (older than 30 days)
DELETE FROM vending_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Optimize tables
OPTIMIZE TABLE players;
OPTIMIZE TABLE scores;
OPTIMIZE TABLE vending_logs;
OPTIMIZE TABLE spring_vending_logs;

-- Update table statistics
ANALYZE TABLE players;
ANALYZE TABLE scores;
ANALYZE TABLE vending_logs;
ANALYZE TABLE spring_vending_logs;
```

This database schema provides the foundation for storing and managing all game-related data with proper relationships and performance optimization.