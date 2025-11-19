-- Add Spring SDK vending columns to existing tables
-- This migration adds enhanced logging capabilities for Spring SDK integration

-- Add Spring SDK specific columns to vending_logs table
ALTER TABLE `vending_logs` 
ADD COLUMN `spring_channel` INT NULL COMMENT 'Channel used by Spring SDK',
ADD COLUMN `spring_error_code` INT NULL COMMENT 'Spring SDK error code',
ADD COLUMN `spring_error_message` VARCHAR(255) NULL COMMENT 'Spring SDK error description',
ADD COLUMN `spring_tier` VARCHAR(20) NULL COMMENT 'Prize tier (gold/silver/bronze)',
ADD COLUMN `spring_success` BOOLEAN DEFAULT FALSE COMMENT 'Spring SDK dispensing success status',
ADD COLUMN `source` VARCHAR(20) DEFAULT 'legacy' COMMENT 'Dispensing source (legacy/spring_sdk)';

-- Add Spring SDK log table for detailed tracking
CREATE TABLE `spring_vending_logs` (
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

-- Add index for performance
CREATE INDEX `idx_spring_vending_logs_timestamp` ON `spring_vending_logs` (`timestamp`);
CREATE INDEX `idx_spring_vending_logs_action` ON `spring_vending_logs` (`action`);
CREATE INDEX `idx_spring_vending_logs_success` ON `spring_vending_logs` (`success`);

-- Update existing vending_logs table indexes for better performance
CREATE INDEX `idx_vending_logs_timestamp` ON `vending_logs` (`created_at`);
CREATE INDEX `idx_vending_logs_score_id` ON `vending_logs` (`score_id`);
CREATE INDEX `idx_vending_logs_source` ON `vending_logs` (`source`);