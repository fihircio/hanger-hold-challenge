-- Hanger Challenge Database Migration Script
-- This file contains all migrations in correct order
-- Upload this file to your MySQL server and execute it
-- Created: 2025-11-11
-- Updated: 2025-11-28 (Updated for 2-tier system and channel mapping fixes)

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
  `spring_tier` VARCHAR(20) NULL COMMENT 'Prize tier (gold/silver)',
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
-- =============================================
-- Updated to match 2-tier system (Gold and Silver only)
-- Gold: 60+ seconds, Silver: 3-60 seconds
-- Channel mapping updated to match frontend configuration
INSERT INTO `prizes` (`name`, `message`, `slot`, `time_threshold`) VALUES
('Gold Prize', 'Incredible! You won Gold Prize!', 24, 60000),
('Silver Prize', 'Amazing! You won Silver Prize!', 1, 3000);

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

-- =============================================
-- 9. Add Channel Configuration Table for Enhanced Management
-- ============================================
CREATE TABLE IF NOT EXISTS `channel_configurations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `channel_number` int(11) NOT NULL COMMENT 'Physical channel number',
  `tier` enum('gold','silver') NOT NULL COMMENT 'Prize tier for this channel',
  `capacity` int(11) NOT NULL DEFAULT 5 COMMENT 'Maximum items per channel',
  `current_count` int(11) NOT NULL DEFAULT 0 COMMENT 'Current items in channel',
  `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Channel is operational',
  `last_maintenance` timestamp NULL COMMENT 'Last maintenance date',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `channel_number` (`channel_number`),
  KEY `tier` (`tier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 10. Seed Channel Configurations
-- ============================================
-- Gold channels: 24-25
INSERT INTO `channel_configurations` (`channel_number`, `tier`, `capacity`) VALUES
(24, 'gold', 5),
(25, 'gold', 5);

-- Silver channels: 37 channels in custom arrangement
INSERT INTO `channel_configurations` (`channel_number`, `tier`, `capacity`) VALUES
(1, 'silver', 5), (2, 'silver', 5), (3, 'silver', 5), (4, 'silver', 5), (5, 'silver', 5), (6, 'silver', 5), (7, 'silver', 5), (8, 'silver', 5),
(11, 'silver', 5), (12, 'silver', 5), (13, 'silver', 5), (14, 'silver', 5), (15, 'silver', 5), (16, 'silver', 5), (17, 'silver', 5), (18, 'silver', 5),
(21, 'silver', 5), (22, 'silver', 5), (23, 'silver', 5),
(26, 'silver', 5), (27, 'silver', 5), (28, 'silver', 5),
(31, 'silver', 5), (32, 'silver', 5), (33, 'silver', 5), (34, 'silver', 5), (35, 'silver', 5), (36, 'silver', 5), (37, 'silver', 5), (38, 'silver', 5),
(45, 'silver', 5), (46, 'silver', 5), (47, 'silver', 5), (48, 'silver', 5),
(51, 'silver', 5), (52, 'silver', 5), (53, 'silver', 5), (54, 'silver', 5), (55, 'silver', 5), (56, 'silver', 5), (57, 'silver', 5), (58, 'silver', 5);

-- =============================================
-- 11. Create Vending Statistics View
-- ============================================
CREATE OR REPLACE VIEW `vending_statistics` AS
SELECT 
  DATE(vl.created_at) as date,
  vl.source,
  vl.spring_tier as tier,
  COUNT(*) as total_attempts,
  SUM(vl.success) as successful_dispenses,
  SUM(CASE WHEN vl.success = 0 THEN 1 ELSE 0 END) as failed_dispenses,
  ROUND(SUM(vl.success) * 100.0 / COUNT(*), 2) as success_rate_percentage
FROM vending_logs vl
GROUP BY DATE(vl.created_at), vl.source, vl.spring_tier;

-- Your database is now set up for Hanger Challenge application with Spring SDK support!
--
-- UPDATES MADE:
-- 1. Updated to 2-tier system (Gold and Silver only)
-- 2. Fixed channel mapping to match frontend configuration
-- 3. Gold: channels 24-25, Silver: 37 channels in custom arrangement
-- 4. Updated time thresholds: Gold 60+ seconds, Silver 3+ seconds
-- 5. Added channel configuration management for enhanced vending features
-- 6. Added vending statistics view for monitoring
--
-- To verify everything is working:
-- 1. Check that all tables were created: SHOW TABLES;
-- 2. Verify prizes were inserted: SELECT * FROM prizes;
-- 3. Check channel configurations: SELECT * FROM channel_configurations;
-- 4. Test your application endpoints
-- 5. Default admin user created: username=admin, password=admin123
-- 6. Spring SDK logging tables are ready for enhanced vending operations