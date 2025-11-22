# Database and API Update Plan for Inventory Management

## Overview
Your system has new inventory management features that need to be integrated into your production database and API endpoints. This document provides the exact updates needed.

## 1. Database Migration Updates

### File to Update: `backend/complete_migration.sql`

#### Update the header comment:
```sql
-- Hanger Challenge Database Migration Script
-- This file contains all migrations in the correct order
-- Upload this file to your MySQL server and execute it
-- Created: 2025-11-11
-- Updated: 2025-11-22 (Added Inventory Management System)
```

#### Add these new tables after line 142 (after the users table insertion):

```sql
-- =============================================
-- 9. Create Slot Inventory Table
-- =============================================
CREATE TABLE IF NOT EXISTS `slot_inventory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `slot` int(11) NOT NULL UNIQUE,
  `tier` enum('gold', 'silver') NOT NULL,
  `dispense_count` int(11) NOT NULL DEFAULT 0,
  `max_dispenses` int(11) NOT NULL DEFAULT 5,
  `last_dispensed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_slot` (`slot`),
  KEY `idx_tier` (`tier`),
  KEY `idx_dispense_count` (`dispense_count`),
  KEY `idx_updated_at` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 10. Create Dispensing Logs Table
-- =============================================
CREATE TABLE IF NOT EXISTS `dispensing_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `slot` int(11) NOT NULL,
  `tier` enum('gold', 'silver') NOT NULL,
  `success` tinyint(1) NOT NULL DEFAULT 0,
  `error` text DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `source` varchar(50) NOT NULL DEFAULT 'tcn_integration',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_slot` (`slot`),
  KEY `idx_tier` (`tier`),
  KEY `idx_success` (`success`),
  KEY `idx_timestamp` (`timestamp`),
  KEY `idx_source` (`source`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 11. Create Out of Stock Logs Table
-- =============================================
CREATE TABLE IF NOT EXISTS `out_of_stock_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tier` enum('gold', 'silver') NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `source` varchar(50) NOT NULL DEFAULT 'tcn_integration',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tier` (`tier`),
  KEY `idx_timestamp` (`timestamp`),
  KEY `idx_source` (`source`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 12. Seed Slot Inventory Data
-- =============================================
-- Gold slots (24-25)
INSERT INTO `slot_inventory` (`slot`, `tier`) VALUES
(24, 'gold'),
(25, 'gold');

-- Silver slots (1-8, 11-18, 21-28, 31-38, 45-48, 51-58)
INSERT INTO `slot_inventory` (`slot`, `tier`) VALUES
(1, 'silver'), (2, 'silver'), (3, 'silver'), (4, 'silver'),
(5, 'silver'), (6, 'silver'), (7, 'silver'), (8, 'silver'),
(11, 'silver'), (12, 'silver'), (13, 'silver'), (14, 'silver'),
(15, 'silver'), (16, 'silver'), (17, 'silver'), (18, 'silver'),
(21, 'silver'), (22, 'silver'), (23, 'silver'), (24, 'silver'),
(25, 'silver'), (26, 'silver'), (27, 'silver'), (28, 'silver'),
(31, 'silver'), (32, 'silver'), (33, 'silver'), (34, 'silver'),
(35, 'silver'), (36, 'silver'), (37, 'silver'), (38, 'silver'),
(45, 'silver'), (46, 'silver'), (47, 'silver'), (48, 'silver'),
(51, 'silver'), (52, 'silver'), (53, 'silver'), (54, 'silver'),
(55, 'silver'), (56, 'silver'), (57, 'silver'), (58, 'silver');
```

#### Update the final verification section:
```sql
-- Your database is now set up for the Hanger Challenge application with Spring SDK and Inventory Management support!
--
-- To verify everything is working:
-- 1. Check that all tables were created: SHOW TABLES;
-- 2. Verify prizes were inserted: SELECT * FROM prizes;
-- 3. Verify slot inventory was created: SELECT * FROM slot_inventory;
-- 4. Test your application endpoints
-- 5. Default admin user created: username=admin, password=admin123
-- 6. Spring SDK logging tables are ready for enhanced vending operations
-- 7. Inventory management system is ready with 36 slots (2 gold, 34 silver)
```

## 2. API Endpoints Update

### File to Update: `backend/api_endpoints_for_server.php`

#### Add these new functions after the `getTimeTier` function (around line 82):

```php
/**
 * Get request body as associative array
 */
function getRequestBody() {
    $input = file_get_contents('php://input');
    return json_decode($input, true) ?: [];
}

/**
 * Get route parameter from path
 */
function getRouteParam($path, $index) {
    $parts = explode('/', trim($path, '/'));
    return isset($parts[$index]) ? $parts[$index] : null;
}
```

#### Add these new GET endpoints in `handleGetRequest` function (before the else statement around line 320):

```php
// Inventory endpoints
elseif ($path === '/api/inventory/slots' || $path === '/api/inventory/slots/') {
    $result = $conn->query("SELECT slot, tier, dispense_count, max_dispenses, last_dispensed_at, updated_at FROM slot_inventory ORDER BY slot");
    $slots = [];
    while ($row = $result->fetch_assoc()) {
        $usagePercentage = $row['max_dispenses'] > 0 ? round(($row['dispense_count'] / $row['max_dispenses']) * 100, 1) : 0;
        $slots[] = [
            'slot' => (int)$row['slot'],
            'tier' => $row['tier'],
            'dispense_count' => (int)$row['dispense_count'],
            'max_dispenses' => (int)$row['max_dispenses'],
            'last_dispensed_at' => $row['last_dispensed_at'],
            'updated_at' => $row['updated_at'],
            'usage_percentage' => $usagePercentage,
            'needs_refill' => $row['dispense_count'] >= ($row['max_dispenses'] * 0.8)
        ];
    }
    echo json_encode(['success' => true, 'data' => $slots, 'total_slots' => count($slots)]);
}

elseif (strpos($path, '/api/inventory/slots/') === 0) {
    $tier = getRouteParam($path, 3);
    if (in_array($tier, ['gold', 'silver'])) {
        $stmt = $conn->prepare("SELECT slot, tier, dispense_count, max_dispenses FROM slot_inventory WHERE tier = ? ORDER BY slot");
        $stmt->bind_param("s", $tier);
        $stmt->execute();
        $result = $stmt->get_result();
        $slots = [];
        while ($row = $result->fetch_assoc()) {
            $usagePercentage = $row['max_dispenses'] > 0 ? round(($row['dispense_count'] / $row['max_dispenses']) * 100, 1) : 0;
            $slots[] = [
                'slot' => (int)$row['slot'],
                'tier' => $row['tier'],
                'dispense_count' => (int)$row['dispense_count'],
                'max_dispenses' => (int)$row['max_dispenses'],
                'usage_percentage' => $usagePercentage,
                'needs_refill' => $row['dispense_count'] >= ($row['max_dispenses'] * 0.8)
            ];
        }
        echo json_encode(['success' => true, 'tier' => $tier, 'data' => $slots, 'total_tier_slots' => count($slots)]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => true, 'message' => 'Invalid tier. Must be gold or silver']);
    }
}

elseif ($path === '/api/inventory/stats' || $path === '/api/inventory/stats/') {
    $result = $conn->query("SELECT tier, COUNT(*) as count, SUM(dispense_count) as total_dispensed FROM slot_inventory GROUP BY tier");
    $stats = [];
    $totalSlots = 0;
    $totalDispensed = 0;
    while ($row = $result->fetch_assoc()) {
        $stats[$row['tier']] = [
            'slots' => (int)$row['count'],
            'dispensed' => (int)$row['total_dispensed']
        ];
        $totalSlots += (int)$row['count'];
        $totalDispensed += (int)$row['total_dispensed'];
    }
    
    $goldSlots = $stats['gold']['slots'] ?? 0;
    $silverSlots = $stats['silver']['slots'] ?? 0;
    $goldDispensed = $stats['gold']['dispensed'] ?? 0;
    $silverDispensed = $stats['silver']['dispensed'] ?? 0;
    
    $emptySlotsResult = $conn->query("SELECT COUNT(*) as count FROM slot_inventory WHERE dispense_count >= max_dispenses");
    $emptySlots = (int)($emptySlotsResult->fetch_assoc()['count']);
    
    $needingRefillResult = $conn->query("SELECT COUNT(*) as count FROM slot_inventory WHERE dispense_count >= 4");
    $slotsNeedingRefill = (int)($needingRefillResult->fetch_assoc()['count']);
    
    echo json_encode([
        'success' => true,
        'data' => [
            'total_slots' => $totalSlots,
            'gold_slots' => $goldSlots,
            'silver_slots' => $silverSlots,
            'total_dispensed' => $totalDispensed,
            'gold_dispensed' => $goldDispensed,
            'silver_dispensed' => $silverDispensed,
            'empty_slots' => $emptySlots,
            'slots_needing_refill' => $slotsNeedingRefill,
            'overall_usage_percentage' => $totalSlots > 0 ? round(($totalDispensed / ($totalSlots * 5)) * 100, 1) : 0,
            'gold_usage_percentage' => $goldSlots > 0 ? round(($goldDispensed / ($goldSlots * 5)) * 100, 1) : 0,
            'silver_usage_percentage' => $silverSlots > 0 ? round(($silverDispensed / ($silverSlots * 5)) * 100, 1) : 0
        ]
    ]);
}

elseif ($path === '/api/inventory/slots-needing-refill' || $path === '/api/inventory/slots-needing-refill/') {
    $threshold = isset($_GET['threshold']) ? (float)$_GET['threshold'] : 0.8;
    $thresholdCount = floor(5 * $threshold);
    
    $stmt = $conn->prepare("SELECT slot, tier, dispense_count, max_dispenses FROM slot_inventory WHERE dispense_count >= ? ORDER BY slot");
    $stmt->bind_param("i", $thresholdCount);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $slots = [];
    while ($row = $result->fetch_assoc()) {
        $usagePercentage = round(($row['dispense_count'] / $row['max_dispenses']) * 100, 1);
        $slots[] = [
            'slot' => (int)$row['slot'],
            'tier' => $row['tier'],
            'dispense_count' => (int)$row['dispense_count'],
            'max_dispenses' => (int)$row['max_dispenses'],
            'usage_percentage' => $usagePercentage
        ];
    }
    
    echo json_encode([
        'success' => true,
        'threshold' => $threshold,
        'threshold_count' => $thresholdCount,
        'data' => $slots,
        'total_slots_needing_refill' => count($slots)
    ]);
}

elseif ($path === '/api/inventory/dispensing-logs' || $path === '/api/inventory/dispensing-logs/') {
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
    $tier = $_GET['tier'] ?? null;
    
    $query = "SELECT id, slot, tier, success, error, timestamp, source, created_at FROM dispensing_logs";
    $params = [];
    
    if ($tier) {
        $query .= " WHERE tier = ?";
        $params[] = $tier;
    }
    
    $query .= " ORDER BY created_at DESC LIMIT ?";
    $params[] = $limit;
    
    $stmt = $conn->prepare($query);
    if ($params) {
        $types = str_repeat('s', count($params) - 1) . 'i';
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    
    $logs = [];
    while ($row = $result->fetch_assoc()) {
        $logs[] = [
            'id' => (int)$row['id'],
            'slot' => (int)$row['slot'],
            'tier' => $row['tier'],
            'success' => (bool)$row['success'],
            'error' => $row['error'],
            'timestamp' => $row['timestamp'],
            'source' => $row['source'],
            'created_at' => $row['created_at']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $logs,
        'total_logs' => count($logs),
        'limit' => $limit,
        'tier_filter' => $tier
    ]);
}

elseif ($path === '/api/inventory/out-of-stock-logs' || $path === '/api/inventory/out-of-stock-logs/') {
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
    $tier = $_GET['tier'] ?? null;
    
    $query = "SELECT id, tier, timestamp, source, created_at FROM out_of_stock_logs";
    $params = [];
    
    if ($tier) {
        $query .= " WHERE tier = ?";
        $params[] = $tier;
    }
    
    $query .= " ORDER BY created_at DESC LIMIT ?";
    $params[] = $limit;
    
    $stmt = $conn->prepare($query);
    if ($params) {
        $types = str_repeat('s', count($params) - 1) . 'i';
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    
    $logs = [];
    while ($row = $result->fetch_assoc()) {
        $logs[] = [
            'id' => (int)$row['id'],
            'tier' => $row['tier'],
            'timestamp' => $row['timestamp'],
            'source' => $row['source'],
            'created_at' => $row['created_at']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $logs,
        'total_logs' => count($logs),
        'limit' => $limit,
        'tier_filter' => $tier
    ]);
}

elseif ($path === '/api/inventory/system-health' || $path === '/api/inventory/system-health/') {
    $totalSlotsResult = $conn->query("SELECT COUNT(*) as count FROM slot_inventory");
    $totalSlots = (int)($totalSlotsResult->fetch_assoc()['count']);
    
    $emptySlotsResult = $conn->query("SELECT COUNT(*) as count FROM slot_inventory WHERE dispense_count >= max_dispenses");
    $emptySlots = (int)($emptySlotsResult->fetch_assoc()['count']);
    
    $criticalSlotsResult = $conn->query("SELECT COUNT(*) as count FROM slot_inventory WHERE dispense_count >= 4");
    $criticalSlots = (int)($criticalSlotsResult->fetch_assoc()['count']);
    
    $recentLogsResult = $conn->query("SELECT success FROM dispensing_logs ORDER BY created_at DESC LIMIT 10");
    $recentFailures = 0;
    $totalRecentLogs = 0;
    while ($row = $recentLogsResult->fetch_assoc()) {
        $totalRecentLogs++;
        if (!$row['success']) $recentFailures++;
    }
    
    $healthStatus = $criticalSlots > 0 ? 'warning' : 'healthy';
    $successRate = $totalRecentLogs > 0 ? round((($totalRecentLogs - $recentFailures) / $totalRecentLogs) * 100, 1) : 100;
    
    echo json_encode([
        'success' => true,
        'data' => [
            'total_slots' => $totalSlots,
            'empty_slots' => $emptySlots,
            'critical_slots' => $criticalSlots,
            'operational_slots' => $totalSlots - $emptySlots,
            'health_status' => $healthStatus,
            'recent_failures' => $recentFailures,
            'success_rate' => $successRate,
            'timestamp' => date('Y-m-d H:i:s')
        ]
    ]);
}
```

#### Add these new POST endpoints in `handlePostRequest` function (before the else statement around line 594):

```php
// Inventory POST endpoints
elseif (strpos($path, '/api/inventory/slot/') === 0 && strpos($path, '/increment') !== false) {
    $pathParts = explode('/', trim($path, '/'));
    $slot = isset($pathParts[3]) ? (int)$pathParts[3] : 0;
    
    if ($slot <= 0) {
        http_response_code(400);
        echo json_encode(['error' => true, 'message' => 'Valid slot number is required']);
        return;
    }
    
    $stmt = $conn->prepare("SELECT slot, tier, dispense_count, max_dispenses FROM slot_inventory WHERE slot = ?");
    $stmt->bind_param("i", $slot);
    $stmt->execute();
    $result = $stmt->get_result();
    $slotData = $result->fetch_assoc();
    
    if (!$slotData) {
        http_response_code(404);
        echo json_encode(['error' => true, 'message' => 'Slot not found']);
        return;
    }
    
    if ($slotData['dispense_count'] >= $slotData['max_dispenses']) {
        http_response_code(400);
        echo json_encode(['error' => true, 'message' => 'Slot already at maximum capacity']);
        return;
    }
    
    $newCount = $slotData['dispense_count'] + 1;
    $usagePercentage = round(($newCount / $slotData['max_dispenses']) * 100, 1);
    
    $updateStmt = $conn->prepare("UPDATE slot_inventory SET dispense_count = ?, last_dispensed_at = NOW(), updated_at = NOW() WHERE slot = ?");
    $updateStmt->bind_param("ii", $newCount, $slot);
    $updateStmt->execute();
    
    echo json_encode([
        'success' => true,
        'message' => "Slot {$slot} incremented successfully",
        'data' => [
            'slot' => (int)$slot,
            'tier' => $slotData['tier'],
            'dispense_count' => $newCount,
            'max_dispenses' => (int)$slotData['max_dispenses'],
            'usage_percentage' => $usagePercentage
        ]
    ]);
}

elseif ($path === '/api/inventory/reset' || $path === '/api/inventory/reset/') {
    $result = $conn->query("UPDATE slot_inventory SET dispense_count = 0, last_dispensed_at = NULL, updated_at = NOW()");
    $affectedRows = $conn->affected_rows;
    
    echo json_encode([
        'success' => true,
        'message' => 'All slot counts reset successfully',
        'total_slots_reset' => $affectedRows
    ]);
}

elseif ($path === '/api/inventory/log-dispensing' || $path === '/api/inventory/log-dispensing/') {
    $input = getRequestBody();
    
    $requiredFields = ['slot', 'tier', 'success', 'timestamp', 'source'];
    foreach ($requiredFields as $field) {
        if (empty($input[$field])) {
            http_response_code(400);
            echo json_encode(['error' => true, 'message' => "Missing required field: {$field}"]);
            return;
        }
    }
    
    $stmt = $conn->prepare("INSERT INTO dispens_logs (slot, tier, success, error, timestamp, source) VALUES (?, ?, ?, ?, ?, ?)");
    $error = $input['error'] ?? null;
    $stmt->bind_param("isisss", $input['slot'], $input['tier'], $input['success'], $error, $input['timestamp'], $input['source']);
    $stmt->execute();
    
    $logId = $conn->insert_id;
    
    echo json_encode([
        'success' => true,
        'message' => 'Dispensing log recorded successfully',
        'data' => [
            'log_id' => $logId,
            'slot' => $input['slot'],
            'tier' => $input['tier'],
            'success' => $input['success'],
            'error' => $error,
            'timestamp' => $input['timestamp'],
            'source' => $input['source']
        ]
    ]);
}

elseif ($path === '/api/inventory/log-out-of-stock' || $path === '/api/inventory/log-out-of-stock/') {
    $input = getRequestBody();
    
    $requiredFields = ['tier', 'timestamp', 'source'];
    foreach ($requiredFields as $field) {
        if (empty($input[$field])) {
            http_response_code(400);
            echo json_encode(['error' => true, 'message' => "Missing required field: {$field}"]);
            return;
        }
    }
    
    $stmt = $conn->prepare("INSERT INTO out_of_stock_logs (tier, timestamp, source) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $input['tier'], $input['timestamp'], $input['source']);
    $stmt->execute();
    
    $logId = $conn->insert_id;
    
    echo json_encode([
        'success' => true,
        'message' => 'Out of stock log recorded successfully',
        'data' => [
            'log_id' => $logId,
            'tier' => $input['tier'],
            'timestamp' => $input['timestamp'],
            'source' => $input['source']
        ]
    ]);
}
```

## 3. Implementation Steps

### Step 1: Update Database
1. Backup your current database
2. Update `backend/complete_migration.sql` with the changes above
3. Re-upload and execute the migration file on your MySQL server
4. Verify new tables were created: `SHOW TABLES;`
5. Check slot inventory data: `SELECT * FROM slot_inventory;`

### Step 2: Update API Endpoints
1. Update `backend/api_endpoints_for_server.php` with the changes above
2. Re-upload the file to your server
3. Test the new endpoints with curl commands

### Step 3: Test Key Endpoints
```bash
# Test slot inventory
curl -X GET http://your-server.com/api/inventory/slots

# Test statistics
curl -X GET http://your-server.com/api/inventory/stats

# Test increment slot
curl -X POST http://your-server.com/api/inventory/slot/24/increment \
  -H "Content-Type: application/json" -d '{}'

# Test system health
curl -X GET http://your-server.com/api/inventory/system-health
```

## 4. Verification Checklist

- [ ] Database has 11 tables total (original 8 + 3 new inventory tables)
- [ ] Slot inventory table has 36 entries (2 gold, 34 silver)
- [ ] All inventory API endpoints return proper responses
- [ ] Frontend can connect to new inventory endpoints
- [ ] TCN integration service can log dispensing and out-of-stock events
- [ ] Inventory tracking works correctly during gameplay

## 5. Notes

1. **Slot Configuration**: The system uses 36 slots total:
   - Gold: Slots 24-25 (2 slots)
   - Silver: Slots 1-8, 11-18, 21-28, 31-38, 45-48, 51-58 (34 slots)

2. **Max Dispenses**: Each slot can dispense 5 prizes before needing refill

3. **Usage Thresholds**:
   - 80% (4 dispenses): Warning level - needs refill
   - 100% (5 dispenses): Critical level - out of stock

4. **Offline Support**: The `inventoryStorageService.ts` provides offline queuing that syncs when connection is restored

This update plan ensures your production environment has all the latest inventory management features that are already implemented in your codebase.