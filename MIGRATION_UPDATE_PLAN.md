# Database Migration Update Plan

## Overview
Your current `complete_migration.sql` needs to be updated to include the Spring SDK integration changes from `007_add_spring_vending_columns.sql`.

## Required Changes

### 1. Update vending_logs table definition
Add these new columns to the existing `vending_logs` table definition (lines 55-70):

```sql
-- Add these columns after line 63 (error_message):
ADD COLUMN `spring_channel` INT NULL COMMENT 'Channel used by Spring SDK',
ADD COLUMN `spring_error_code` INT NULL COMMENT 'Spring SDK error code',
ADD COLUMN `spring_error_message` VARCHAR(255) NULL COMMENT 'Spring SDK error description',
ADD COLUMN `spring_tier` VARCHAR(20) NULL COMMENT 'Prize tier (gold/silver/bronze)',
ADD COLUMN `spring_success` BOOLEAN DEFAULT FALSE COMMENT 'Spring SDK dispensing success status',
ADD COLUMN `source` VARCHAR(20) DEFAULT 'legacy' COMMENT 'Dispensing source (legacy/spring_sdk)';
```

### 2. Add new spring_vending_logs table
Add this new table definition after the vending_logs table (around line 71):

```sql
-- =============================================
-- 5. Create Spring Vending Logs Table
-- =============================================
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
```

### 3. Update vending_logs table indexes
Add these indexes after the vending_logs table definition (around line 70):

```sql
-- Additional indexes for better performance
CREATE INDEX `idx_vending_logs_timestamp` ON `vending_logs` (`created_at`);
CREATE INDEX `idx_vending_logs_score_id` ON `vending_logs` (`score_id`);
CREATE INDEX `idx_vending_logs_source` ON `vending_logs` (`source`);
```

### 4. Update section numbering
Since we're adding a new table, update the section numbers:
- Current "5. Seed Prizes Table" becomes "6. Seed Prizes Table"
- Current "6. Create Users Table" becomes "7. Create Users Table"
- Current "7. Insert Default Admin User" becomes "8. Insert Default Admin User"

### 5. Update the final comment
Update the final comment to reflect the Spring SDK integration:

```sql
-- Your database is now set up for the Hanger Challenge application with Spring SDK support!
--
-- To verify everything is working:
-- 1. Check that all tables were created: SHOW TABLES;
-- 2. Verify prizes were inserted: SELECT * FROM prizes;
-- 3. Test your application endpoints
-- 4. Default admin user created: username=admin, password=admin123
-- 5. Spring SDK logging tables are ready for enhanced vending operations
```

## Implementation Steps

1. Backup your current `complete_migration.sql` file
2. Apply the changes listed above
3. Upload the updated file to your server
4. Drop the existing database and recreate it with the new migration
5. Test the endpoints with curl commands

## Testing Commands

After applying the migration, test with:

```bash
curl https://vendinghanger.eeelab.xyz/api_endpoints_for_server.php/vending/status
curl https://vendinghanger.eeelab.xyz/api_endpoints_for_server.php/leaderboard
```

## API Compatibility

Your current `api_endpoints_for_server.php` file should work with the updated database structure. The Spring SDK columns are all nullable or have default values, so existing queries won't break.