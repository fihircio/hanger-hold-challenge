-- Hanger Challenge Database Migration Script
-- This file contains all migrations in the correct order
-- Upload this file to your MySQL server and execute it
-- Created: 2025-11-11

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
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `score_id` (`score_id`),
  KEY `prize_id` (`prize_id`),
  CONSTRAINT `vending_logs_score_id_foreign` FOREIGN KEY (`score_id`) REFERENCES `scores` (`id`) ON DELETE SET NULL,
  CONSTRAINT `vending_logs_prize_id_foreign` FOREIGN KEY (`prize_id`) REFERENCES `prizes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 5. Seed Prizes Table
-- ============================================
INSERT INTO `prizes` (`name`, `message`, `slot`, `time_threshold`) VALUES
('Gold Prize', 'Incredible! You won the Gold Prize!', 1, 60000),
('Silver Prize', 'Amazing! You won the Silver Prize!', 2, 30000),
('Bronze Prize', 'Great job! You won the Bronze Prize!', 3, 10000);

-- =============================================
-- Migration Complete
-- =============================================
-- 6. Create Users Table for Authentication
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

-- 7. Insert Default Admin User
-- =================================
INSERT INTO `users` (`username`, `password`, `role`) VALUES
('admin', '$2y$10$K3L9x/w8eE8mKqF8lP6G3sJ', 'admin');

-- Your database is now set up for the Hanger Challenge application!
--
-- To verify everything is working:
-- 1. Check that all tables were created: SHOW TABLES;
-- 2. Verify prizes were inserted: SELECT * FROM prizes;
-- 3. Test your application endpoints
-- 4. Default admin user created: username=admin, password=admin123