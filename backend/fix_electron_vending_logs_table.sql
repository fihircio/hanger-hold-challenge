-- Fix Electron Vending Logs Table Structure
-- This file fixes the 500 errors with /api/electron-vending/log endpoint
-- Created: 2025-12-17

-- =============================================
-- Fix Electron Vending Logs Table Structure
-- =============================================

-- Drop existing table if it exists to recreate with correct structure
DROP TABLE IF EXISTS `electron_vending_logs`;

-- Recreate table with correct structure matching PHP bind parameters
CREATE TABLE `electron_vending_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `action` varchar(50) NOT NULL COMMENT 'Action type (prize_dispensing, slot_selection, inventory_sync, etc.)',
  `game_time_ms` int(11) DEFAULT NULL COMMENT 'Game time in milliseconds',
  `tier` varchar(20) DEFAULT NULL COMMENT 'Prize tier determined (gold/silver)',
  `selected_slot` int(11) DEFAULT NULL COMMENT 'Slot selected for dispensing',
  `channel_used` int(11) DEFAULT NULL COMMENT 'Channel used by Spring SDK',
  `score_id` int(11) DEFAULT NULL COMMENT 'Related score ID',
  `prize_id` int(11) DEFAULT NULL COMMENT 'Related prize ID',
  `success` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Action success status',
  `error_code` int(11) DEFAULT NULL COMMENT 'Error code if failed',
  `error_message` text DEFAULT NULL COMMENT 'Detailed error message',
  `dispense_method` varchar(50) DEFAULT 'legacy' COMMENT 'Method used (spring_sdk/legacy/fallback)',
  `inventory_before` int(11) DEFAULT NULL COMMENT 'Slot count before operation',
  `inventory_after` int(11) DEFAULT NULL COMMENT 'Slot count after operation',
  `response_time_ms` int(11) DEFAULT NULL COMMENT 'Operation response time in milliseconds',
  `source` varchar(50) NOT NULL DEFAULT 'electron_vending_service' COMMENT 'Log source',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_action` (`action`),
  KEY `idx_tier` (`tier`),
  KEY `idx_selected_slot` (`selected_slot`),
  KEY `idx_success` (`success`),
  KEY `idx_score_id` (`score_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_source` (`source`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key constraint for score_id if scores table exists
ALTER TABLE `electron_vending_logs` 
ADD CONSTRAINT `electron_vending_logs_score_id_foreign` 
FOREIGN KEY (`score_id`) REFERENCES `scores` (`id`) ON DELETE SET NULL;

-- Add foreign key constraint for prize_id if prizes table exists
ALTER TABLE `electron_vending_logs` 
ADD CONSTRAINT `electron_vending_logs_prize_id_foreign` 
FOREIGN KEY (`prize_id`) REFERENCES `prizes` (`id`) ON DELETE SET NULL;

-- =============================================
-- Verification
-- =============================================

-- Verify table structure
DESCRIBE `electron_vending_logs`;

-- Check foreign key constraints
SELECT 
    CONSTRAINT_NAME, 
    TABLE_NAME, 
    COLUMN_NAME, 
    REFERENCED_TABLE_NAME, 
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'eeelab46_vendinghangerdb' 
    AND TABLE_NAME = 'electron_vending_logs' 
    AND REFERENCED_TABLE_NAME IS NOT NULL;

-- =============================================
-- Changes Made
-- =============================================

-- 1. Changed tier column from enum('gold', 'silver') to varchar(20)
--    - This allows NULL values and prevents enum constraint violations
-- 2. Added proper foreign key constraints
--    - score_id references scores.id with ON DELETE SET NULL
--    - prize_id references prizes.id with ON DELETE SET NULL
-- 3. Maintained all existing indexes for performance
-- 4. Used proper character set and collation
-- 5. Fixed column order to match PHP bind_param sequence

-- This fix resolves the 500 errors with /api/electron-vending/log endpoint
-- by ensuring the table structure matches the PHP code expectations