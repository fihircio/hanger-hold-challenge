<?php

// API Endpoints for Server-Side Integration
// Place this file on your MySQL server (e.g., vendinghanger.eeelab.xyz/apiendpoints.php)
// This will allow your Electron app to bypass IP restrictions

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

// Handle different endpoints based on URL path
$requestUri = $_SERVER['REQUEST_URI'];
$scriptName = $_SERVER['SCRIPT_NAME'];

// Remove the script name from the request URI to get the actual path
$path = str_replace($scriptName, '', $requestUri);

// Ensure path starts with a '/'
if (empty($path) || $path[0] !== '/') {
    $path = '/' . $path;
}

// Database connection (using your existing credentials)
$host = 'vendinghanger.eeelab.xyz';
$database = 'eeelab46_vendinghangerdb';
$username = 'eeelab46_vendinghangeruser';
$password = 'vendinghanger@2025';

try {
    $conn = new mysqli($host, $username, $password, $database);
    
    if ($conn->connect_error) {
        die(json_encode(['error' => true, 'message' => 'Database connection failed']));
    }
    
    // Route the request
    switch ($method) {
        case 'GET':
            handleGetRequest($conn, $path);
            break;
            
        case 'POST':
            handlePostRequest($conn, $path);
            break;
            
        case 'OPTIONS':
            // Handle preflight requests
            http_response_code(200);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => true, 'message' => 'Method not allowed']);
            break;
    }
    
    $conn->close();
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => true, 'message' => $e->getMessage()]);
}

/**
 * Convert score time in milliseconds to prize tier
 */
function getTimeTier(int $timeMs): string {
    if ($timeMs >= 60000) {          // 60+ seconds = Gold
        return 'gold';
    } elseif ($timeMs >= 30000) {     // 30-59.999 seconds = Silver
        return 'silver';
    } elseif ($timeMs >= 10000) {     // 10-29.999 seconds = Bronze
        return 'bronze';
    } else {                           // <10 seconds = No prize
        return 'none';
    }
}

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

function handleGetRequest($conn, $path) {
    // Players endpoint
    if ($path === '/players' || $path === '/players/') {
        if (isset($_GET['id'])) {
            // Get specific player
            $id = (int)$_GET['id'];
            $stmt = $conn->prepare("SELECT id, name, email, phone FROM players WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $player = $result->fetch_assoc();
            
            if ($player) {
                echo json_encode($player);
            } else {
                http_response_code(404);
                echo json_encode(['error' => true, 'message' => 'Player not found']);
            }
        } else {
            // Get all players
            $result = $conn->query("SELECT id, name, email, phone FROM players ORDER BY created_at DESC");
            $players = [];
            while ($row = $result->fetch_assoc()) {
                $players[] = $row;
            }
            echo json_encode(['players' => $players]);
        }
    }
    
    // Scores endpoint
    elseif ($path === '/scores' || $path === '/scores/') {
        if (isset($_GET['player_id'])) {
            // Get scores for specific player
            $player_id = (int)$_GET['player_id'];
            $stmt = $conn->prepare("SELECT s.id, s.time, s.prize_id, s.dispensed, s.created_at, p.name as player_name FROM scores s JOIN players p ON s.player_id = p.id WHERE s.player_id = ? ORDER BY s.time DESC");
            $stmt->bind_param("i", $player_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $scores = [];
            while ($row = $result->fetch_assoc()) {
                $scores[] = $row;
            }
            echo json_encode(['scores' => $scores]);
        } else {
            // Get all scores with player names
            $result = $conn->query("SELECT s.id, s.time, s.prize_id, s.dispensed, s.created_at, p.name as player_name FROM scores s JOIN players p ON s.player_id = p.id ORDER BY s.time DESC LIMIT 50");
            $scores = [];
            while ($row = $result->fetch_assoc()) {
                $scores[] = $row;
            }
            echo json_encode(['scores' => $scores]);
        }
    }
    
    // Leaderboard endpoint
    elseif ($path === '/leaderboard' || $path === '/leaderboard/') {
        $result = $conn->query("SELECT s.id, s.time, s.created_at, p.name as player_name FROM scores s JOIN players p ON s.player_id = p.id ORDER BY s.time DESC LIMIT 10");
        $scores = [];
        while ($row = $result->fetch_assoc()) {
            $scores[] = $row;
        }
        echo json_encode(['scores' => $scores]);
    }
    
    // Prizes endpoint
    elseif ($path === '/prizes' || $path === '/prizes/') {
        if (isset($_GET['check'])) {
            // Check prize eligibility
            $time = (int)($_GET['time'] ?? 0);
            $stmt = $conn->prepare("SELECT * FROM prizes WHERE active = 1 AND time_threshold <= ? ORDER BY time_threshold DESC LIMIT 1");
            $stmt->bind_param("i", $time);
            $stmt->execute();
            $result = $stmt->get_result();
            $prize = $result->fetch_assoc();
            
            if ($prize) {
                echo json_encode(['eligible' => true, 'prize' => $prize]);
            } else {
                echo json_encode(['eligible' => false, 'message' => 'No prize eligible for this time']);
            }
        } else {
            // Get all prizes
            $result = $conn->query("SELECT * FROM prizes WHERE active = 1 ORDER BY time_threshold DESC");
            $prizes = [];
            while ($row = $result->fetch_assoc()) {
                $prizes[] = $row;
            }
            echo json_encode(['prizes' => $prizes]);
        }
    }
    
    // Vending status endpoint
    elseif ($path === '/vending/status' || $path === '/vending/status/') {
        $result = $conn->query("SELECT vl.*, p.name as prize_name, s.time as score_time FROM vending_logs vl JOIN prizes p ON vl.prize_id = p.id LEFT JOIN scores s ON vl.score_id = s.id ORDER BY vl.created_at DESC LIMIT 10");
        $logs = [];
        while ($row = $result->fetch_assoc()) {
            $logs[] = $row;
        }
        echo json_encode(['status' => 'operational', 'logs' => $logs]);
    }
    
    // Enhanced vending status endpoint with Spring SDK data
    elseif ($path === '/vending/status-enhanced' || $path === '/vending/status-enhanced/') {
        // Get recent vending logs including Spring SDK columns
        $result = $conn->query("SELECT vl.*, p.name as prize_name, s.time as score_time, pl.name as player_name FROM vending_logs vl LEFT JOIN prizes p ON vl.prize_id = p.id LEFT JOIN scores s ON vl.score_id = s.id LEFT JOIN players pl ON s.player_id = pl.id ORDER BY vl.created_at DESC LIMIT 10");
        $logs = [];
        while ($row = $result->fetch_assoc()) {
            $logs[] = [
                'id' => $row['id'],
                'prize_name' => $row['prize_name'] ?? 'Unknown',
                'player_name' => $row['player_name'] ?? 'Unknown',
                'slot' => $row['slot'],
                'success' => $row['success'],
                'error_message' => $row['error_message'],
                'spring_channel' => $row['spring_channel'],
                'spring_tier' => $row['spring_tier'],
                'spring_success' => $row['spring_success'],
                'source' => $row['source'],
                'created_at' => $row['created_at']
            ];
        }
        
        // Calculate system health
        $totalResult = $conn->query("SELECT COUNT(*) as total, SUM(success) as successful FROM vending_logs");
        $totalStats = $totalResult->fetch_assoc();
        $totalLogs = (int)$totalStats['total'];
        $successfulLogs = (int)$totalStats['successful'];
        $successRate = $totalLogs > 0 ? round(($successfulLogs / $totalLogs) * 100, 2) : 0;
        
        // Get Spring SDK specific stats
        $springResult = $conn->query("SELECT COUNT(*) as total, SUM(spring_success) as successful FROM vending_logs WHERE source = 'spring_sdk'");
        $springStats = $springResult->fetch_assoc();
        $springTotalLogs = (int)$springStats['total'];
        $springSuccessfulLogs = (int)$springStats['successful'];
        $springSuccessRate = $springTotalLogs > 0 ? round(($springSuccessfulLogs / $springTotalLogs) * 100, 2) : 0;
        
        // Get Spring SDK file logs
        $springFileLogs = [];
        $logFile = 'spring_vending.log';
        if (file_exists($logFile)) {
            $lines = array_slice(file($logFile), -5);
            foreach ($lines as $line) {
                $logEntry = json_decode($line, true);
                if ($logEntry) {
                    $springFileLogs[] = $logEntry;
                }
            }
        }
        
        echo json_encode([
            'status' => 'operational',
            'success_rate' => $successRate,
            'spring_sdk' => [
                'enabled' => true,
                'total_logs' => $springTotalLogs,
                'success_rate' => $springSuccessRate,
                'recent_logs' => array_reverse($springFileLogs)
            ],
            'recent_logs' => $logs,
            'system_health' => [
                'total_operations' => $totalLogs,
                'successful_operations' => $successfulLogs,
                'success_rate_percentage' => $successRate
            ]
        ]);
    }
    
    // System diagnostics endpoint
    elseif ($path === '/vending/diagnostics' || $path === '/vending/diagnostics/') {
        $tests = [];
        
        // Test 1: Database connection
        $tests[] = [
            'name' => 'database_connection',
            'status' => 'pass',
            'message' => 'Database connection successful'
        ];
        
        // Test 2: Spring SDK logger
        $logFile = 'spring_vending.log';
        $logWritable = is_writable(dirname($logFile)) || (!file_exists($logFile) && is_writable('.'));
        $tests[] = [
            'name' => 'spring_sdk_logger',
            'status' => $logWritable ? 'pass' : 'fail',
            'message' => $logWritable ? 'Spring SDK logging system operational' : 'Spring SDK log file not writable'
        ];
        
        // Test 3: Database tables
        $tablesResult = $conn->query("SHOW TABLES LIKE 'vending_logs'");
        $vendingLogsExists = $tablesResult->num_rows > 0;
        $tests[] = [
            'name' => 'vending_logs_table',
            'status' => $vendingLogsExists ? 'pass' : 'fail',
            'message' => $vendingLogsExists ? 'vending_logs table exists' : 'vending_logs table missing'
        ];
        
        // Test 4: Spring SDK columns
        if ($vendingLogsExists) {
            $columnsResult = $conn->query("SHOW COLUMNS FROM vending_logs LIKE 'spring_%'");
            $springColumnsExist = $columnsResult->num_rows > 0;
            $tests[] = [
                'name' => 'spring_sdk_columns',
                'status' => $springColumnsExist ? 'pass' : 'fail',
                'message' => $springColumnsExist ? 'Spring SDK columns exist' : 'Spring SDK columns missing'
            ];
        }
        
        // Test 5: Recent activity
        $recentResult = $conn->query("SELECT COUNT(*) as count FROM vending_logs WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)");
        $recentStats = $recentResult->fetch_assoc();
        $recentActivity = (int)$recentStats['count'];
        $tests[] = [
            'name' => 'recent_activity',
            'status' => $recentActivity > 0 ? 'pass' : 'warn',
            'message' => $recentActivity > 0 ? "Recent activity: {$recentActivity} operations in last hour" : 'No recent activity in last hour'
        ];
        
        $overallStatus = 'pass';
        foreach ($tests as $test) {
            if ($test['status'] === 'fail') {
                $overallStatus = 'fail';
                break;
            } elseif ($test['status'] === 'warn') {
                $overallStatus = 'warn';
            }
        }
        
        echo json_encode([
            'success' => true,
            'diagnostics' => [
                'overall_status' => $overallStatus,
                'tests' => $tests,
                'timestamp' => date('Y-m-d H:i:s')
            ]
        ]);
    }
    
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
        
        $stmt = $conn->prepare("INSERT INTO dispensing_logs (slot, tier, success, error, timestamp, source) VALUES (?, ?, ?, ?, ?, ?)");
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
    
    else {
        http_response_code(404);
        echo json_encode(['error' => true, 'message' => 'Endpoint not found']);
    }
}

function handlePostRequest($conn, $path) {
    // Get POST data
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Players endpoint - Create new player
    if ($path === '/players' || $path === '/players/') {
        $name = $input['name'] ?? '';
        $email = $input['email'] ?? null;
        $phone = $input['phone'] ?? null;
        
        if (empty($name)) {
            http_response_code(400);
            echo json_encode(['error' => true, 'message' => 'Name is required']);
            return;
        }
        
        // Check if player with email already exists
        if ($email) {
            $stmt = $conn->prepare("SELECT id, name, email, phone FROM players WHERE email = ?");
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $result = $stmt->get_result();
            $existingPlayer = $result->fetch_assoc();
            
            if ($existingPlayer) {
                echo json_encode([
                    'id' => $existingPlayer['id'],
                    'name' => $existingPlayer['name'],
                    'email' => $existingPlayer['email'],
                    'phone' => $existingPlayer['phone'],
                    'existing' => true
                ]);
                return;
            }
        }
        
        // Create new player
        $stmt = $conn->prepare("INSERT INTO players (name, email, phone) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $name, $email, $phone);
        $stmt->execute();
        
        $player_id = $conn->insert_id;
        echo json_encode([
            'id' => $player_id,
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'existing' => false
        ]);
    }
    
    // Scores endpoint - Create new score
    elseif ($path === '/scores' || $path === '/scores/') {
        $player_id = (int)($input['player_id'] ?? 0);
        $time = (int)($input['time'] ?? 0);
        
        if ($player_id <= 0 || $time <= 0) {
            http_response_code(400);
            echo json_encode(['error' => true, 'message' => 'Player ID and time are required']);
            return;
        }
        
        // Check if player exists
        $stmt = $conn->prepare("SELECT id FROM players WHERE id = ?");
        $stmt->bind_param("i", $player_id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(['error' => true, 'message' => 'Player not found']);
            return;
        }
        
        // Check for prize eligibility
        $stmt = $conn->prepare("SELECT id FROM prizes WHERE active = 1 AND time_threshold <= ? ORDER BY time_threshold DESC LIMIT 1");
        $stmt->bind_param("i", $time);
        $stmt->execute();
        $result = $stmt->get_result();
        $prize = $result->fetch_assoc();
        $prize_id = $prize ? $prize['id'] : null;
        
        // Create score
        $stmt = $conn->prepare("INSERT INTO scores (player_id, time, prize_id, dispensed) VALUES (?, ?, ?, 0)");
        $stmt->bind_param("iii", $player_id, $time, $prize_id);
        $stmt->execute();
        
        $score_id = $conn->insert_id;
        
        // Return score with prize info
        $response = [
            'id' => $score_id,
            'player_id' => $player_id,
            'time' => $time,
            'prize' => $prize
        ];
        
        echo json_encode($response);
    }
    
    // Vending endpoint - Dispense prize
    elseif ($path === '/vending/dispense' || $path === '/vending/dispense/') {
        $prize_id = (int)($input['prize_id'] ?? 0);
        $score_id = (int)($input['score_id'] ?? 0);
        
        if ($prize_id <= 0 || $score_id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => true, 'message' => 'Prize ID and Score ID are required']);
            return;
        }
        
        // Get prize and score info
        $stmt = $conn->prepare("SELECT p.slot, s.dispensed FROM prizes p LEFT JOIN scores s ON s.id = ? WHERE p.id = ?");
        $stmt->bind_param("ii", $score_id, $prize_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $data = $result->fetch_assoc();
        
        if (!$data) {
            http_response_code(404);
            echo json_encode(['error' => true, 'message' => 'Prize or Score not found']);
            return;
        }
        
        if ($data['dispensed']) {
            http_response_code(400);
            echo json_encode(['error' => true, 'message' => 'Prize already dispensed for this score']);
            return;
        }
        
        // Simulate vending command (same as in your VendingController)
        $slotNumber = $data['slot'];
        $command = sprintf('00 FF %02X FF AA 55', $slotNumber, 255 - $slotNumber);
        $response = '00 5D 00 AA 07'; // Success response
        
        // Log the vending operation
        $stmt = $conn->prepare("INSERT INTO vending_logs (score_id, prize_id, slot, command, response, success) VALUES (?, ?, ?, ?, ?, 1)");
        $stmt->bind_param("iiiss", $score_id, $prize_id, $slotNumber, $command, $response);
        $stmt->execute();
        
        // Update score as dispensed
        $stmt = $conn->prepare("UPDATE scores SET dispensed = 1, prize_id = ? WHERE id = ?");
        $stmt->bind_param("ii", $prize_id, $score_id);
        $stmt->execute();
        
        echo json_encode([
            'success' => true,
            'score_id' => $score_id,
            'prize_id' => $prize_id,
            'slot' => $slotNumber,
            'command' => $command,
            'response' => $response
        ]);
    }
    
    // Spring SDK dispensing endpoint
    elseif ($path === '/vending/dispense-spring' || $path === '/vending/dispense-spring/') {
        $tier = $input['tier'] ?? '';
        $score_id = (int)($input['score_id'] ?? 0);
        
        // If tier not provided, get it from score time
        if (empty($tier) && $score_id > 0) {
            $stmt = $conn->prepare("SELECT time FROM scores WHERE id = ?");
            $stmt->bind_param("i", $score_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $scoreData = $result->fetch_assoc();
            
            if ($scoreData) {
                $tier = getTimeTier((int)$scoreData['time']);
            }
        }
        
        if (empty($tier) || $score_id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => true, 'message' => 'Score ID is required and tier must be determinable']);
            return;
        }
        
        // Handle 'none' tier from getTimeTier function
        if ($tier === 'none') {
            http_response_code(400);
            echo json_encode(['error' => true, 'message' => 'Score time too low for prize eligibility. Minimum 10 seconds required.']);
            return;
        }
        
        // Log dispensing attempt to file
        $logEntry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'action' => 'dispensing_attempt',
            'tier' => $tier,
            'score_id' => $score_id,
            'source' => 'game_screen'
        ];
        file_put_contents('spring_vending.log', json_encode($logEntry) . "\n", FILE_APPEND);
        
        // Determine channel based on tier
        $channel = 0;
        $prize_id = 0;
        switch ($tier) {
            case 'gold':
                $channel = rand(1, 5); // Gold channels 1-5
                $prize_id = 1;
                break;
            case 'silver':
                $channel = rand(6, 15); // Silver channels 6-15
                $prize_id = 2;
                break;
            case 'bronze':
                $channel = rand(16, 25); // Bronze channels 16-25
                $prize_id = 3;
                break;
            default:
                http_response_code(400);
                echo json_encode(['error' => true, 'message' => 'Invalid tier. Must be gold, silver, or bronze']);
                return;
        }
        
        // Simulate Spring SDK dispensing (80% success rate)
        $success = rand(1, 100) <= 80;
        $error = null;
        
        if ($success) {
            // Log success
            $logEntry = [
                'timestamp' => date('Y-m-d H:i:s'),
                'action' => 'dispensing_success',
                'tier' => $tier,
                'channel' => $channel,
                'source' => 'spring_sdk'
            ];
            file_put_contents('spring_vending.log', json_encode($logEntry) . "\n", FILE_APPEND);
            
            // Update score as dispensed
            $stmt = $conn->prepare("UPDATE scores SET dispensed = 1, prize_id = ? WHERE id = ?");
            $stmt->bind_param("ii", $prize_id, $score_id);
            $stmt->execute();
            
        } else {
            $error = 'Spring SDK channel error - motor malfunction';
            
            // Log failure
            $logEntry = [
                'timestamp' => date('Y-m-d H:i:s'),
                'action' => 'dispensing_failure',
                'tier' => $tier,
                'error' => $error,
                'source' => 'spring_sdk'
            ];
            file_put_contents('spring_vending.log', json_encode($logEntry) . "\n", FILE_APPEND);
        }
        
        // Create enhanced vending log entry
        $stmt = $conn->prepare("INSERT INTO vending_logs (score_id, prize_id, slot, command, response, success, error_message, spring_channel, spring_tier, spring_success, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'spring_sdk')");
        $command = 'spring_sdk_dispense';
        $response = $success ? 'success' : 'failed';
        $stmt->bind_param("iiisssisii", $score_id, $prize_id, $channel, $command, $response, $success, $error, $channel, $tier, $success);
        $stmt->execute();
        
        echo json_encode([
            'success' => $success,
            'tier' => $tier,
            'channel' => $channel,
            'message' => $success ? "{$tier} prize dispensed successfully via Spring SDK" : "Failed to dispense {$tier} prize via Spring SDK",
            'error' => $error,
            'spring_sdk_used' => true
        ]);
    }
    
    else {
        http_response_code(404);
        echo json_encode(['error' => true, 'message' => 'Endpoint not found']);
    }
}