<?php

use DI\Container;
use Slim\Factory\AppFactory;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

require_once __DIR__ . '/../vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// Create DI container
$container = new Container();

// Set container to create App with on-demand
AppFactory::setContainer($container);

// Create app instance
$app = AppFactory::create();

// Add routing middleware
$app->addRoutingMiddleware();

// Add body parsing middleware
$app->addBodyParsingMiddleware();

// Add CORS middleware
$app->add(function ($request, $handler) {
    $response = $handler->handle($request);
    return $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
});

// Add error handling middleware
$app->addErrorMiddleware(true, true, true);

// CORS preflight route
$app->options('/{routes:.*}', function (Request $request, Response $response) {
    return $response;
});

// Simple test route
$app->get('/test', function (Request $request, Response $response) {
    $response->getBody()->write('API is working!');
    return $response;
});

// Simple file-based storage for demo
$storageFile = __DIR__ . '/../storage.json';

function loadStorage() {
    global $storageFile;
    // Add file locking to prevent concurrent access issues
    $lockFile = $storageFile . '.lock';
    $maxWaitTime = 5; // Maximum wait time for lock
    
    $waitTime = 0;
    while (file_exists($lockFile) && $waitTime < $maxWaitTime) {
        usleep(100000); // Wait 100ms
        $waitTime += 0.1;
    }
    
    if (file_exists($storageFile)) {
        $data = json_decode(file_get_contents($storageFile), true);
        return $data ?: ['players' => [], 'scores' => [], 'playerIdCounter' => 1, 'scoreIdCounter' => 1];
    }
    return ['players' => [], 'scores' => [], 'playerIdCounter' => 1, 'scoreIdCounter' => 1];
}

function saveStorage($data) {
    global $storageFile;
    $lockFile = $storageFile . '.lock';
    
    // Create lock
    $lockHandle = fopen($lockFile, 'w');
    if (!$lockHandle) {
        return false; // Could not create lock
    }
    
    try {
        // Write data with proper JSON formatting
        $json = json_encode($data, JSON_PRETTY_PRINT);
        file_put_contents($storageFile, $json, LOCK_EX);
        return true;
    } finally {
        // Always release lock
        fclose($lockHandle);
        if (file_exists($lockFile)) {
            unlink($lockFile);
        }
    }
}

// Load initial storage
$storage = loadStorage();
$players = &$storage['players'];
$scores = &$storage['scores'];
$playerIdCounter = &$storage['playerIdCounter'];
$scoreIdCounter = &$storage['scoreIdCounter'];

// Simple API routes
$app->get('/api/leaderboard', function (Request $request, Response $response) use (&$scores, &$players) {
    // Sort scores by time (ascending - lower time is better)
    usort($scores, function($a, $b) {
        return $a['time'] - $b['time'];
    });
    
    // Add player names to scores
    $scoresWithNames = array_map(function($score) use (&$players) {
        $player = array_filter($players, function($p) use ($score) {
            return $p['id'] == $score['player_id'];
        });
        $player = reset($player);
        return [
            'id' => $score['id'],
            'name' => $player ? $player['name'] : 'Unknown',
            'time' => $score['time'],
            'created_at' => $score['created_at'] ?? date('Y-m-d H:i:s')
        ];
    }, $scores);
    
    $response->getBody()->write(json_encode(['scores' => array_slice($scoresWithNames, 0, 10), 'total' => count($scores)]));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->post('/api/players', function (Request $request, Response $response) use (&$players, &$playerIdCounter, &$storage) {
    $data = json_decode($request->getBody()->getContents(), true);
    $player = [
        'id' => $playerIdCounter++,
        'name' => $data['name'] ?? 'Anonymous',
        'email' => $data['email'] ?? '',
        'phone' => $data['phone'] ?? ''
    ];
    $players[] = $player;
    saveStorage($storage);
    $response->getBody()->write(json_encode($player));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->post('/api/scores', function (Request $request, Response $response) use (&$scores, &$scoreIdCounter, &$storage) {
    $data = json_decode($request->getBody()->getContents(), true);
    $score = [
        'id' => $scoreIdCounter++,
        'player_id' => $data['player_id'] ?? 1,
        'time' => $data['time'] ?? 0,
        'created_at' => date('Y-m-d H:i:s')
    ];
    $scores[] = $score;
    saveStorage($storage);
    $response->getBody()->write(json_encode($score));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/api/prizes/check', function (Request $request, Response $response) {
    $time = (int)($request->getQueryParams()['time'] ?? 0);
    $eligible = $time < 30000; // Eligible if under 30 seconds
    
    $prize = null;
    if ($eligible) {
        $prize = [
            'id' => 1,
            'name' => 'Test Prize',
            'slot' => 1,
            'message' => 'Congratulations!',
            'time_threshold' => 30000
        ];
    }
    
    $response->getBody()->write(json_encode(['eligible' => $eligible, 'prize' => $prize]));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/api/prizes', function (Request $request, Response $response) {
    $prizes = [
        ['id' => 1, 'name' => 'Test Prize 1', 'slot' => 1, 'time_threshold' => 30000, 'message' => 'Great job!'],
        ['id' => 2, 'name' => 'Test Prize 2', 'slot' => 2, 'time_threshold' => 20000, 'message' => 'Excellent!'],
        ['id' => 3, 'name' => 'Test Prize 3', 'slot' => 3, 'time_threshold' => 10000, 'message' => 'Amazing!']
    ];
    $response->getBody()->write(json_encode(['prizes' => $prizes]));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->post('/api/vending/dispense', function (Request $request, Response $response) {
    $data = json_decode($request->getBody()->getContents(), true);
    $prizeId = $data['prize_id'] ?? 1;
    $scoreId = $data['score_id'] ?? 1;
    
    // Map prize_id to slot number
    $slotMap = [1 => 1, 2 => 2, 3 => 3];
    $slotNumber = $slotMap[$prizeId] ?? 1;
    
    $response->getBody()->write(json_encode([
        'success' => true,
        'message' => 'Prize dispensed',
        'prize_id' => $prizeId,
        'score_id' => $scoreId,
        'slot' => $slotNumber
    ]));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/api/vending/status', function (Request $request, Response $response) {
    $response->getBody()->write(json_encode(['status' => 'ready', 'logs' => []]));
    return $response->withHeader('Content-Type', 'application/json');
});

// Run app
$app->run();