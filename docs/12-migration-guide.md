# Migration Guide

## Overview

This guide covers database migration procedures for the Hanger Hold Challenge system, including schema updates, data migration, and version management.

## Migration Strategy

### Migration Types
1. **Schema Migrations**: Database structure changes
2. **Data Migrations**: Data population and updates
3. **Configuration Migrations**: Environment and settings changes
4. **Rollback Migrations**: Revert procedures if needed

## Pre-Migration Checklist

### Backup Strategy
```bash
# 1. Create full database backup
mysqldump --single-transaction --routines --triggers \
  --routines --triggers \
  -u hanger_user -p \
  hanger_challenge > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Backup application files
tar -czf /var/backups/hanger-challenge/app_backup_$(date +%Y%m%d_%H%M%S).tar.gz \
  /var/www/hanger-challenge \
  --exclude=node_modules --exclude=build

# 3. Verify backup integrity
gzip -t backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Environment Preparation
```bash
# 1. Put application in maintenance mode
# Add to .env
APP_MAINTENANCE_MODE=true

# 2. Notify users
echo "System maintenance scheduled at $(date)"

# 3. Prepare rollback script
cat > rollback_$(date +%Y%m%d_%H%M%S).sql << 'EOF'
-- Rollback script for migration $(date)
-- This will be executed if migration fails
EOF
```

## Schema Migrations

### Migration File Structure
```bash
migrations/
├── 001_create_players_table.sql
├── 002_create_scores_table.sql
├── 003_create_prizes_table.sql
├── 004_create_vending_logs_table.sql
├── 005_seed_prizes_table.sql
├── 006_add_spring_vending_columns.sql
├── 007_create_spring_vending_logs_table.sql
├── 008_create_slot_inventory_table.sql
├── 009_create_dispensing_logs_table.sql
├── 010_create_out_of_stock_logs_table.sql
└── complete_migration.sql
```

### Migration Execution

#### Step 1: Migration Script
```bash
#!/bin/bash
# migrate-database.sh

DB_NAME="hanger_challenge"
DB_USER="hanger_user"
DB_PASS="migration_password"
MIGRATION_DIR="/path/to/migrations"

# Function to execute migration
execute_migration() {
    local migration_file=$1
    local description=$2
    
    echo "Executing: $description"
    
    if mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$migration_file"; then
        echo "✅ Migration successful: $description"
        return 0
    else
        echo "❌ Migration failed: $description"
        echo "Error: $(mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" 2>&1)"
        return 1
    fi
}

# Execute migrations in order
for migration in "$MIGRATION_DIR"/*.sql; do
    case "$(basename "$migration")" in
        "001_create_players_table.sql")
            execute_migration "$migration" "Create players table"
            ;;
        "002_create_scores_table.sql")
            execute_migration "$migration" "Create scores table"
            ;;
        "003_create_prizes_table.sql")
            execute_migration "$migration" "Create prizes table"
            ;;
        "004_create_vending_logs_table.sql")
            execute_migration "$migration" "Create vending logs table"
            ;;
        "005_seed_prizes_table.sql")
            execute_migration "$migration" "Seed prizes table"
            ;;
        "006_add_spring_vending_columns.sql")
            execute_migration "$migration" "Add Spring SDK columns"
            ;;
        "007_create_spring_vending_logs_table.sql")
            execute_migration "$migration" "Create Spring vending logs table"
            ;;
        "008_create_slot_inventory_table.sql")
            execute_migration "$migration" "Create slot inventory table"
            ;;
        "009_create_dispensing_logs_table.sql")
            execute_migration "$migration" "Create dispensing logs table"
            ;;
        "010_create_out_of_stock_logs_table.sql")
            execute_migration "$migration" "Create out of stock logs table"
            ;;
        *)
            echo "Unknown migration: $(basename "$migration")"
            return 1
            ;;
    esac
    
    # Exit on first failure
    if [ $? -ne 0 ]; then
        echo "Migration failed. Rolling back..."
        exit 1
    fi
done

echo "All migrations completed successfully"
```

#### Step 2: Rollback Script
```bash
#!/bin/bash
# rollback-database.sh

DB_NAME="hanger_challenge"
DB_USER="hanger_user"
DB_PASS="rollback_password"
BACKUP_FILE="$1"

# Function to execute rollback
execute_rollback() {
    echo "Executing rollback from: $BACKUP_FILE"
    
    if mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$BACKUP_FILE"; then
        echo "✅ Rollback successful"
        return 0
    else
        echo "❌ Rollback failed"
        echo "Error: $(mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" 2>&1)"
        return 1
    fi
}

execute_rollback
```

## Data Migrations

### Migration 1: Add Spring SDK Support

#### Migration File: 006_add_spring_vending_columns.sql
```sql
-- Add Spring SDK columns to vending_logs table
ALTER TABLE `vending_logs` 
ADD COLUMN `spring_channel` INT NULL COMMENT 'Channel used by Spring SDK',
ADD COLUMN `spring_error_code` INT NULL COMMENT 'Spring SDK error code',
ADD COLUMN `spring_error_message` VARCHAR(255) NULL COMMENT 'Spring SDK error description',
ADD COLUMN `spring_tier` VARCHAR(20) NULL COMMENT 'Prize tier (gold/silver/bronze)',
ADD COLUMN `spring_success` BOOLEAN DEFAULT FALSE COMMENT 'Spring SDK dispensing success status',
ADD COLUMN `source` VARCHAR(20) DEFAULT 'legacy' COMMENT 'Dispensing source (legacy/spring_sdk)';

-- Add indexes for Spring SDK columns
CREATE INDEX `idx_vending_logs_spring_channel` ON `vending_logs`(`spring_channel`);
CREATE INDEX `idx_vending_logs_spring_success` ON `vending_logs`(`spring_success`);
CREATE INDEX `idx_vending_logs_source` ON `vending_logs`(`source`);
```

#### Data Migration: Populate Source Column
```sql
-- Update existing records to identify source
UPDATE `vending_logs` 
SET `source` = 'legacy' 
WHERE `source` IS NULL;
```

### Migration 2: Spring Vending Logs Table

#### Migration File: 007_create_spring_vending_logs_table.sql
```sql
-- Create dedicated Spring vending logs table
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

-- Add indexes for performance
CREATE INDEX `idx_spring_vending_logs_timestamp` ON `spring_vending_logs`(`timestamp`);
CREATE INDEX `idx_spring_vending_logs_action` ON `spring_vending_logs`(`action`);
CREATE INDEX `idx_spring_vending_logs_success` ON `spring_vending_logs`(`success`);
CREATE INDEX `idx_spring_vending_logs_score_id` ON `spring_vending_logs`(`score_id`);
```

#### Data Migration: Initialize Spring SDK Logging
```sql
-- Insert initial Spring SDK log entry
INSERT INTO `spring_vending_logs` (`action`, `source`, `created_at`)
VALUES ('system_initialized', 'spring_sdk', NOW());
```

### Migration 3: Inventory Management System

#### Migration File: 008_create_slot_inventory_table.sql
```sql
-- Create slot inventory tracking table
CREATE TABLE `slot_inventory` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `slot` INT NOT NULL COMMENT 'Physical slot number',
  `tier` ENUM('gold', 'silver') NOT NULL COMMENT 'Prize tier for this slot',
  `dispense_count` INT DEFAULT 0 COMMENT 'Number of times dispensed',
  `max_dispenses` INT DEFAULT 5 COMMENT 'Maximum dispenses before refill',
  `needs_refill` BOOLEAN DEFAULT FALSE COMMENT 'Whether slot needs refilling',
  `last_dispensed_at` TIMESTAMP NULL COMMENT 'Last dispensing timestamp',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Slot creation timestamp',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  
  UNIQUE KEY `unique_slot` (`slot`),
  INDEX `idx_slot_inventory_tier` (`tier`),
  INDEX `idx_slot_inventory_needs_refill` (`needs_refill`),
  INDEX `idx_slot_inventory_dispense_count` (`dispense_count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Data Migration: Initialize Slot Inventory
```sql
-- Insert 36 slots (2 gold, 34 silver) with proper configuration
INSERT INTO `slot_inventory` (`slot`, `tier`, `max_dispenses`) VALUES
-- Gold slots (24-25)
(24, 'gold', 5),
(25, 'gold', 5),
-- Silver slots (1-23)
(1, 'silver', 5), (2, 'silver', 5), (3, 'silver', 5), (4, 'silver', 5), (5, 'silver', 5),
(6, 'silver', 5), (7, 'silver', 5), (8, 'silver', 5), (9, 'silver', 5), (10, 'silver', 5),
(11, 'silver', 5), (12, 'silver', 5), (13, 'silver', 5), (14, 'silver', 5), (15, 'silver', 5),
(16, 'silver', 5), (17, 'silver', 5), (18, 'silver', 5), (19, 'silver', 5), (20, 'silver', 5),
(21, 'silver', 5), (22, 'silver', 5), (23, 'silver', 5);
```

### Migration 4: Enhanced Dispensing Logging

#### Migration File: 009_create_dispensing_logs_table.sql
```sql
-- Create detailed dispensing logs table
CREATE TABLE `dispensing_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `slot` INT NOT NULL COMMENT 'Slot number used',
  `tier` ENUM('gold', 'silver') NOT NULL COMMENT 'Prize tier',
  `success` BOOLEAN NOT NULL COMMENT 'Whether dispensing succeeded',
  `error` TEXT NULL COMMENT 'Error message if failed',
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Event timestamp',
  `source` VARCHAR(50) DEFAULT 'tcn_integration' COMMENT 'Source of dispensing event',
  `score_id` INT NULL COMMENT 'Associated score ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Log creation timestamp',
  
  INDEX `idx_dispensing_logs_timestamp` (`timestamp`),
  INDEX `idx_dispensing_logs_slot` (`slot`),
  INDEX `idx_dispensing_logs_tier` (`tier`),
  INDEX `idx_dispensing_logs_success` (`success`),
  INDEX `idx_dispensing_logs_score_id` (`score_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Migration 5: Out of Stock Tracking

#### Migration File: 010_create_out_of_stock_logs_table.sql
```sql
-- Create out of stock logs table
CREATE TABLE `out_of_stock_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tier` ENUM('gold', 'silver') NOT NULL COMMENT 'Prize tier that ran out',
  `out_of_stock` BOOLEAN DEFAULT TRUE COMMENT 'Whether tier is out of stock',
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Event timestamp',
  `source` VARCHAR(50) DEFAULT 'tcn_integration' COMMENT 'Source of out of stock event',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Log creation timestamp',
  
  INDEX `idx_out_of_stock_logs_timestamp` (`timestamp`),
  INDEX `idx_out_of_stock_logs_tier` (`tier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Configuration Migrations

### Environment Variable Updates

#### Development to Production Migration
```bash
# Update .env for production
cp .env.example .env.production

# Update configuration
sed -i 's/APP_ENV=development/APP_ENV=production/' .env.production
sed -i 's/APP_DEBUG=true/APP_DEBUG=false/' .env.production
sed -i 's/APP_URL=http:\/\/localhost:8080/APP_URL=https:\/\/your-domain.com/' .env.production
```

## Testing Migrations

### Migration Testing Procedure

#### Step 1: Test Environment Setup
```bash
# Create test database
mysql -u root -p -e "CREATE DATABASE hanger_challenge_test;
CREATE USER 'hanger_user'@'localhost' IDENTIFIED BY 'test_password';
GRANT ALL PRIVILEGES ON hanger_challenge_test.* TO 'hanger_user'@'localhost';
FLUSH PRIVILEGES;
```

#### Step 2: Dry Run Migration
```bash
# Test migration without executing
./migrate-database.sh --dry-run

# Check SQL syntax
mysql -u hanger_user -ptest_password hanger_challenge_test < migration_file.sql
```

#### Step 3: Verify Results
```bash
# Check table structure
mysql -u hanger_user -ptest_password hanger_challenge_test -e "DESCRIBE players"

# Check data integrity
mysql -u hanger_user -ptest_password hanger_challenge_test -e "SELECT COUNT(*) FROM players"
```

## Rollback Procedures

### Automatic Rollback
```bash
# In migration script, add error checking
execute_migration() {
    local migration_file=$1
    local description=$2
    
    # Create savepoint
    mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SAVEPOINT before_migration_$(date +%s);"
    
    if mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$migration_file"; then
        echo "✅ Migration successful: $description"
        # Release savepoint
        mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "RELEASE SAVEPOINT;"
        return 0
    else
        echo "❌ Migration failed: $description"
        # Rollback to savepoint
        mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "ROLLBACK TO SAVEPOINT before_migration_$(date +%s);"
        echo "Rolled back to before migration_$(date +%s)"
        return 1
    fi
}
```

### Manual Rollback
```bash
# Execute rollback script
./rollback-database.sh backup_20251120_120000.sql

# Verify rollback
mysql -u hanger_user -p"$DB_PASS" hanger_challenge_test -e "SELECT COUNT(*) FROM spring_vending_logs"
```

## Post-Migration Verification

### Validation Checklist
```bash
#!/bin/bash
# verify-migration.sh

MIGRATION_VERSION="$1"
TABLE_NAME="$2"

echo "Verifying migration: $MIGRATION_VERSION"

# Check table exists
TABLE_EXISTS=$(mysql -u hanger_user -ptest_password hanger_challenge_test -e "SHOW TABLES LIKE '$TABLE_NAME'" | grep -c "$TABLE_NAME")

if [ -n "$TABLE_EXISTS" ]; then
    echo "❌ Table $TABLE_NAME does not exist"
    exit 1
fi

# Check table structure
echo "Table structure:"
mysql -u hanger_user -ptest_password hanger_challenge_test -e "DESCRIBE $TABLE_NAME"

# Check data count
ROW_COUNT=$(mysql -u hanger_user -ptest_password hanger_challenge_test -e "SELECT COUNT(*) FROM $TABLE_NAME")
echo "Total rows: $ROW_COUNT"

# Check indexes
echo "Indexes:"
mysql -u hanger_user -ptest_password hanger_challenge_test -e "SHOW INDEX FROM $TABLE_NAME"

echo "✅ Migration $MIGRATION_VERSION verified successfully"
```

## Version Management

### Migration Versioning
```sql
-- Create migration versions table
CREATE TABLE `migration_versions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `version` VARCHAR(50) NOT NULL,
  `description` TEXT NOT NULL,
  `executed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `success` BOOLEAN DEFAULT FALSE,
  `rollback` BOOLEAN DEFAULT FALSE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Record migration execution
INSERT INTO `migration_versions` (`version`, `description`, `executed_at`, `success`) 
VALUES ('1.0.0', 'Initial database setup', NOW(), TRUE, FALSE);

-- Record Spring SDK migration
INSERT INTO `migration_versions` (`version`, `description`, `executed_at`, `success`)
VALUES ('1.1.0', 'Add Spring SDK support', NOW(), TRUE, FALSE);

-- Record Inventory Management migration
INSERT INTO `migration_versions` (`version`, `description`, `executed_at`, `success`)
VALUES ('1.2.0', 'Add inventory management system', NOW(), TRUE, FALSE);
```

### Migration Status API
```php
// Add to VendingController.php
public function getMigrationStatus() {
    global $pdo;
    
    $stmt = $pdo->query("
        SELECT version, description, executed_at, success 
        FROM migration_versions 
        ORDER BY executed_at DESC 
        LIMIT 10
    ");
    
    $versions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    return $this->jsonResponse([
        'success' => true,
        'data' => $versions
    ]);
}
```

## Safety Procedures

### Migration Safety Rules
1. **Always backup before migration**
2. **Test migrations in development first**
3. **Use transactions for complex migrations**
4. **Never run migrations in production without testing**
5. **Have rollback plan ready**
6. **Monitor migration performance**
7. **Document all changes**

### Emergency Rollback
```bash
# Emergency rollback procedure
if [ "$MIGRATION_FAILED" = "true" ]; then
    echo "🚨 EMERGENCY ROLLBACK INITIATED"
    
    # Stop application
    sudo systemctl stop hanger-challenge-api
    sudo systemctl stop hanger-challenge-nginx
    
    # Execute rollback
    ./rollback-database.sh emergency_backup.sql
    
    # Verify rollback
    ./verify-migration.sh 1.0.0 players
    
    # Restart services
    sudo systemctl start hanger-challenge-nginx
    sudo systemctl start hanger-challenge-api
    
    echo "🔄 Emergency rollback completed"
fi
```

## Performance Considerations

### Migration Optimization
```sql
-- Batch operations for better performance
INSERT INTO players (name, email) VALUES
  ('Player 1', 'player1@example.com'),
  ('Player 2', 'player2@example.com'),
  ('Player 3', 'player3@example.com');

-- Use transactions for data consistency
START TRANSACTION;
-- Multiple related operations
COMMIT;
```

### Large Dataset Handling
```bash
# For large datasets, use file-based imports
mysql -u hanger_user -p hanger_challenge < large_dataset.sql

# Or use LOAD DATA INFILE for CSV imports
LOAD DATA INFILE '/path/to/data.csv' 
INTO TABLE players 
FIELDS TERMINATED BY ',' 
LINES STARTING BY 1
IGNORE 1 ROWS;
```

This migration guide provides comprehensive procedures for safely updating database schema and data with proper testing, rollback, and verification steps.