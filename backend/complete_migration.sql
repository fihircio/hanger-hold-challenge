-- Hanger Challenge Database Migration Script
-- This file contains all migrations in the correct order
-- Upload this file to your MySQL server and execute it
-- Created: 2025-11-11
-- Updated: 2025-11-14 (Added Spring SDK integration)

-- =============================================
-- 1. Create Players Table
-- ============================================
CREATE TABLE IF NOT EXISTS `players` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 2. Create Scores Table
-- ============================================
CREATE TABLE IF NOT EXISTS `scores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `player_id` int(11) NOT NULL,
  `time` int(11) NOT NULL COMMENT 'Time in milliseconds',
  `prize_id` int(11) DEFAULT NULL,
  `dispensed` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `player_id` (`player_id`),
  KEY `prize_id` (`prize_id`),
  CONSTRAINT `scores_player_id_foreign` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 3. Create Prizes Table
-- ============================================
CREATE TABLE IF NOT EXISTS `prizes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `slot` int(11) NOT NULL,
  `time_threshold` int(11) NOT NULL COMMENT 'Minimum time in milliseconds to qualify',
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slot` (`slot`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 4. Create Vending Logs Table
-- ============================================
CREATE TABLE IF NOT EXISTS `vending_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `score_id` int(11) DEFAULT NULL,
  `prize_id` int(11) NOT NULL,
  `slot` int(11) NOT NULL,
  `command` varchar(255) NOT NULL,
  `response` text DEFAULT NULL,
  `success` tinyint(1) NOT NULL DEFAULT 0,
  `error_message` text DEFAULT NULL,
  -- Spring SDK integration columns
  `spring_channel` INT NULL COMMENT 'Channel used by Spring SDK',
  `spring_error_code` INT NULL COMMENT 'Spring SDK error code',
  `spring_error_message` VARCHAR(255) NULL COMMENT 'Spring SDK error description',
  `spring_tier` VARCHAR(20) NULL COMMENT 'Prize tier (gold/silver/bronze)',
  `spring_success` BOOLEAN DEFAULT FALSE COMMENT 'Spring SDK dispensing success status',
  `source` VARCHAR(20) DEFAULT 'legacy' COMMENT 'Dispensing source (legacy/spring_sdk)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `score_id` (`score_id`),
  KEY `prize_id` (`prize_id`),
  CONSTRAINT `vending_logs_score_id_foreign` FOREIGN KEY (`score_id`) REFERENCES `scores` (`id`) ON DELETE SET NULL,
  CONSTRAINT `vending_logs_prize_id_foreign` FOREIGN KEY (`prize_id`) REFERENCES `prizes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Additional indexes for better performance
CREATE INDEX `idx_vending_logs_timestamp` ON `vending_logs` (`created_at`);
CREATE INDEX `idx_vending_logs_score_id` ON `vending_logs` (`score_id`);
CREATE INDEX `idx_vending_logs_source` ON `vending_logs` (`source`);

-- =============================================
-- 5. Create Spring Vending Logs Table
-- ============================================
CREATE TABLE IF NOT EXISTS `spring_vending_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `action` VARCHAR(50) NOT NULL COMMENT 'Action type (dispensing_attempt, dispensing_success, etc.)',
  `tier` VARCHAR(20) NULL COMMENT 'Prize tier',
  `channel` INT NULL COMMENT 'Channel number',
  `score_id` INT NULL COMMENT 'Related score ID',
  `success` BOOLEAN DEFAULT FALSE COMMENT 'Action success status',
  `error_code` INT NULL COMMENT 'Spring SDK error code',
  `error_message` TEXT NULL COMMENT 'Error description',
  `source` VARCHAR(20) DEFAULT 'spring_sdk' COMMENT 'Log source',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for performance
CREATE INDEX `idx_spring_vending_logs_timestamp` ON `spring_vending_logs` (`timestamp`);
CREATE INDEX `idx_spring_vending_logs_action` ON `spring_vending_logs` (`action`);
CREATE INDEX `idx_spring_vending_logs_success` ON `spring_vending_logs` (`success`);

-- =============================================
-- 6. Seed Prizes Table
-- ============================================
INSERT INTO `prizes` (`name`, `message`, `slot`, `time_threshold`) VALUES
('Gold Prize', 'Incredible! You won the Gold Prize!', 1, 60000),
('Silver Prize', 'Amazing! You won the Silver Prize!', 2, 30000),
('Bronze Prize', 'Great job! You won the Bronze Prize!', 3, 10000);

-- =============================================
-- 7. Create Users Table for Authentication
-- ============================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','operator') NOT NULL DEFAULT 'operator',
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 8. Insert Default Admin User
-- =================================
INSERT INTO `users` (`username`, `password`, `role`) VALUES
('admin', '$2y$10$K3L9x/w8eE8mKqF8lP6G3sJ', 'admin');

-- Your database is now set up for the Hanger Challenge application with Spring SDK support!
--
-- To verify everything is working:
-- 1. Check that all tables were created: SHOW TABLES;
-- 2. Verify prizes were inserted: SELECT * FROM prizes;
-- 3. Test your application endpoints
-- 4. Default admin user created: username=admin, password=admin123
-- 5. Spring SDK logging tables are ready for enhanced vending operations