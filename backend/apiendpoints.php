<?php

// API Endpoints for Server-Side Integration
// Place this file on your MySQL server (e.g., vendinghanger.eeelab.xyz/apiendpoints.php)
// This will allow your Electron app to bypass IP restrictions
// Updated: 2025-12-14 (Added bronze tier support for 3-tier system)

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400'); // Cache preflight for 24 hours

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

// Handle different endpoints based on URL path
// Use parse_url to strip query string so routes like '/apiendpoints.php/prizes?check=1' match '/prizes'
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$scriptName = parse_url($_SERVER['SCRIPT_NAME'], PHP_URL_PATH);

// Remove script name from request path to get actual route
$path = $requestUri;
if ($scriptName && strpos($requestUri, $scriptName) === 0) {
    $path = substr($requestUri, strlen($scriptName));
}

// Ensure path starts with a '/'
if ($path === '' || $path[0] !== '/') {
    $path = '/' . ltrim($path, '/');
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
    
    // Route request
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
            echo json_encode(['status' => 'preflight_ok']);
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
 * Convert score time in milliseconds to prize tier (Updated for 2-tier system)
 */
function getTimeTier(int $timeMs): string {
    if ($timeMs >= 120000) {         // 120+ seconds (2+ minutes) = Gold
        return 'gold';
    } elseif ($timeMs >= 3000) {    // 3 seconds = Silver
        return 'silver';
    } else {                           // <3 seconds = No prize
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
            // Get all players or filter by date
            $date = $_GET['date'] ?? null;
            $include_contact = isset($_GET['include_contact']) && $_GET['include_contact'] === 'true';
            $include_scores = isset($_GET['include_scores']) && $_GET['include_scores'] === 'true';
            
            if ($date) {
                // Filter players by date (created_at) and optionally include scores
                if ($include_scores) {
                    // Join with scores table to get player details and their scores for that date
                    $sql = "SELECT p.id, p.name";
                    if ($include_contact) {
                        $sql .= ", p.email, p.phone";
                    }
                    $sql .= ", s.time as score_time, s.created_at as score_date, s.dispensed 
                            FROM players p 
                            LEFT JOIN scores s ON p.id = s.player_id 
                            WHERE DATE(p.created_at) = ? OR DATE(s.created_at) = ?
                            ORDER BY p.created_at DESC, s.created_at DESC";
                    
                    $stmt = $conn->prepare($sql);
                    $stmt->bind_param("ss", $date, $date);
                } else {
                    $sql = "SELECT id, name";
                    if ($include_contact) {
                        $sql .= ", email, phone";
                    }
                    $sql .= " FROM players WHERE DATE(created_at) = ? ORDER BY created_at DESC";
                    $stmt = $conn->prepare($sql);
                    $stmt->bind_param("s", $date);
                }
                
                $stmt->execute();
                $result = $stmt->get_result();
            } else {
                // Get all players (standard behavior)
                $sql = "SELECT id, name";
                if ($include_contact) {
                    $sql .= ", email, phone";
                }
                $sql .= " FROM players ORDER BY created_at DESC";
                $result = $conn->query($sql);
            }
            
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
        // Check for date filter and contact info request
        $date = $_GET['date'] ?? null;
        $player_id = $_GET['player_id'] ?? null;
        $include_contact = $_GET['include_contact'] ?? null;
        
        if ($date) {
            // Get top 3 scores for specific date
            if ($include_contact) {
                // Include contact information for profile teams
                $stmt = $conn->prepare("SELECT s.id, s.time, s.created_at, s.player_id, p.name as player_name, p.email, p.phone FROM scores s JOIN players p ON s.player_id = p.id WHERE DATE(s.created_at) = ? ORDER BY s.time DESC LIMIT 3");
                $stmt->bind_param("s", $date);
            } else {
                // Standard leaderboard without contact info
                $stmt = $conn->prepare("SELECT s.id, s.time, s.created_at, p.name as player_name FROM scores s JOIN players p ON s.player_id = p.id WHERE DATE(s.created_at) = ? ORDER BY s.time DESC LIMIT 3");
                $stmt->bind_param("s", $date);
            }
            $stmt->execute();
            $result = $stmt->get_result();
        } elseif ($player_id) {
            // Get top 3 scores for specific player
            if ($include_contact) {
                $stmt = $conn->prepare("SELECT s.id, s.time, s.created_at, s.player_id, p.name as player_name, p.email, p.phone FROM scores s JOIN players p ON s.player_id = p.id WHERE s.player_id = ? ORDER BY s.time DESC LIMIT 3");
                $stmt->bind_param("i", $player_id);
            } else {
                $stmt = $conn->prepare("SELECT s.id, s.time, s.created_at, p.name as player_name FROM scores s JOIN players p ON s.player_id = p.id WHERE s.player_id = ? ORDER BY s.time DESC LIMIT 3");
                $stmt->bind_param("i", $player_id);
            }
            $stmt->execute();
            $result = $stmt->get_result();
        } else {
            // Get all-time top 10 (default behavior)
            if ($include_contact) {
                $result = $conn->query("SELECT s.id, s.time, s.created_at, s.player_id, p.name as player_name, p.email, p.phone FROM scores s JOIN players p ON s.player_id = p.id ORDER BY s.time DESC LIMIT 10");
            } else {
                $result = $conn->query("SELECT s.id, s.time, s.created_at, p.name as player_name FROM scores s JOIN players p ON s.player_id = p.id ORDER BY s.time DESC LIMIT 10");
            }
        }
        
        $scores = [];
        $rank = 1;
        while ($row = $result->fetch_assoc()) {
            // Add rank to each score
            $row['rank'] = $rank;
            
            // Only include contact info if requested
            if (!$include_contact) {
                unset($row['email']);
                unset($row['phone']);
                unset($row['player_id']);
            }
            
            $scores[] = $row;
            $rank++;
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
    
    // API Prizes endpoint (for compatibility with backend routes)
    elseif ($path === '/api/prizes/check' || $path === '/api/prizes/check/') {
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
    }
}

function handlePostRequest($conn, $path) {
    // Players endpoint - Create new player
    if ($path === '/players' || $path === '/players/') {
        $data = getRequestBody();
        
        // Validate required fields
        if (!isset($data['name']) || empty($data['name'])) {
            http_response_code(400);
            echo json_encode(['error' => true, 'message' => 'Player name is required']);
            return;
        }
        
        // Check if player already exists by email/phone
        if (isset($data['email']) && !empty($data['email'])) {
            $stmt = $conn->prepare("SELECT id FROM players WHERE email = ?");
            $stmt->bind_param("s", $data['email']);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                $existingPlayer = $result->fetch_assoc();
                echo json_encode([
                    'id' => $existingPlayer['id'],
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'phone' => $data['phone'] ?? null,
                    'existing' => true
                ]);
                return;
            }
        }
        
        // Insert new player
        $stmt = $conn->prepare("INSERT INTO players (name, email, phone) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $data['name'], $data['email'], $data['phone']);
        
        if ($stmt->execute()) {
            $playerId = $conn->insert_id;
            echo json_encode([
                'id' => $playerId,
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'existing' => false
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => true, 'message' => 'Failed to create player']);
        }
    }
    
    // Scores endpoint - Submit new score
    elseif ($path === '/scores' || $path === '/scores/') {
        $data = getRequestBody();
        
        // Validate required fields
        if (!isset($data['name']) || !isset($data['time'])) {
            http_response_code(400);
            echo json_encode(['error' => true, 'message' => 'Player name and time are required']);
            return;
        }
        
        // First, create or get player
        $playerId = null;
        if (isset($data['email']) && !empty($data['email'])) {
            // Check if player exists
            $stmt = $conn->prepare("SELECT id FROM players WHERE email = ?");
            $stmt->bind_param("s", $data['email']);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                $player = $result->fetch_assoc();
                $playerId = $player['id'];
            }
        }
        
        // If no existing player, create new one
        if (!$playerId) {
            $stmt = $conn->prepare("INSERT INTO players (name, email, phone) VALUES (?, ?, ?)");
            $stmt->bind_param("sss", $data['name'], $data['email'], $data['phone']);
            $stmt->execute();
            $playerId = $conn->insert_id;
        }
        
        // Determine prize tier
        $timeMs = (int)$data['time'];
        $tier = getTimeTier($timeMs);
        $prizeId = null;
        
        if ($tier !== 'none') {
            // Get prize for this tier using time_threshold instead of tier column
            // The prizes table doesn't have a tier column, so we'll use time_threshold
            if ($tier === 'gold') {
                $stmt = $conn->prepare("SELECT id FROM prizes WHERE time_threshold >= 120000 AND active = 1 LIMIT 1");
            } else {
                $stmt = $conn->prepare("SELECT id FROM prizes WHERE time_threshold >= 3000 AND time_threshold < 120000 AND active = 1 LIMIT 1");
            }
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                $prize = $result->fetch_assoc();
                $prizeId = $prize['id'];
            }
        }
        
        // Insert score
        $stmt = $conn->prepare("INSERT INTO scores (player_id, time, prize_id, dispensed) VALUES (?, ?, ?, 0)");
        $stmt->bind_param("iii", $playerId, $timeMs, $prizeId);
        
        if ($stmt->execute()) {
            $scoreId = $conn->insert_id;
            echo json_encode([
                'success' => true,
                'score_id' => $scoreId,
                'player_id' => $playerId,
                'time' => $timeMs,
                'tier' => $tier,
                'prize_id' => $prizeId,
                'message' => "Score submitted successfully. Tier: " . ucfirst($tier)
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => true, 'message' => 'Failed to submit score']);
        }
    }
    
    // Electron Vending Log endpoint - use electron_vending_logs table
    elseif ($path === '/api/electron-vending/log' || $path === '/api/electron-vending/log/') {
        $data = getRequestBody();
        
        // Validate required fields (matching electron_vending_logs table schema)
        $requiredFields = ['action', 'tier', 'selected_slot', 'success', 'source'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                http_response_code(400);
                echo json_encode(['error' => true, 'message' => "Missing required field: $field"]);
                return;
            }
        }
        
        // Set optional fields to null if not provided
        $action = $data['action'] ?? 'prize_dispensing';
        $gameTimeMs = $data['game_time_ms'] ?? 0;
        $channelUsed = $data['channel_used'] ?? null;
        $scoreId = $data['score_id'] ?? null;
        $prizeId = $data['prize_id'] ?? null;
        $errorCode = $data['error_code'] ?? null;
        $errorMessage = $data['error_message'] ?? null;
        $dispenseMethod = $data['dispense_method'] ?? 'legacy';
        $inventoryBefore = $data['inventory_before'] ?? null;
        $inventoryAfter = $data['inventory_after'] ?? null;
        $responseTimeMs = $data['response_time_ms'] ?? 0;
        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                http_response_code(400);
                echo json_encode(['error' => true, 'message' => "Missing required field: $field"]);
                return;
            }
        }
        
        // Set optional fields to null if not provided
        $errorCode = isset($data['error_code']) ? $data['error_code'] : null;
        $errorMessage = isset($data['error_message']) ? $data['error_message'] : null;
        
        // Insert dispensing log
        $stmt = $conn->prepare("INSERT INTO electron_vending_logs (action, game_time_ms, tier, selected_slot, channel_used, score_id, prize_id, success, error_code, error_message, dispense_method, inventory_before, inventory_after, response_time_ms, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $stmt->bind_param("sisiisiisisiiis",
            $action,
            $gameTimeMs,
            $data['tier'],
            $data['selected_slot'],
            $channelUsed,
            $scoreId,
            $prizeId,
            $data['success'],
            $errorCode,
            $errorMessage,
            $dispenseMethod,
            $inventoryBefore,
            $inventoryAfter,
            $responseTimeMs,
            $data['source']
        );
        
        if ($stmt->execute()) {
            $logId = $conn->insert_id;
            echo json_encode([
                'success' => true,
                'log_id' => $logId,
                'message' => 'Electron vending log recorded successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => true, 'message' => 'Failed to record electron vending log']);
        }
    }
    
    // Vending dispense endpoint
    elseif ($path === '/vending/dispense' || $path === '/vending/dispense/') {
        $data = getRequestBody();
        
        // Validate required fields
        if (!isset($data['prize_id']) || !isset($data['score_id'])) {
            http_response_code(400);
            echo json_encode(['error' => true, 'message' => 'Prize ID and Score ID are required']);
            return;
        }
        
        // Get prize details
        $stmt = $conn->prepare("SELECT * FROM prizes WHERE id = ? AND active = 1");
        $stmt->bind_param("i", $data['prize_id']);
        $stmt->execute();
        $result = $stmt->get_result();
        $prize = $result->fetch_assoc();
        
        if (!$prize) {
            http_response_code(404);
            echo json_encode(['error' => true, 'message' => 'Prize not found']);
            return;
        }
        
        // Update score as dispensed
        $stmt = $conn->prepare("UPDATE scores SET dispensed = 1 WHERE id = ?");
        $stmt->bind_param("i", $data['score_id']);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'score_id' => $data['score_id'],
                'prize_id' => $data['prize_id'],
                'prize_name' => $prize['name'],
                'slot' => $prize['slot'],
                'message' => 'Prize dispensed successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => true, 'message' => 'Failed to dispense prize']);
        }
    }
    
    else {
        http_response_code(404);
        echo json_encode(['error' => true, 'message' => 'Endpoint not found']);
    }
}
