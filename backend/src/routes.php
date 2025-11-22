<?php

use App\Controllers\PlayerController;
use App\Controllers\ScoreController;
use App\Controllers\PrizeController;
use App\Controllers\VendingController;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;

return function (App $app) {
    // Test route
    $app->get('/test', function (Request $request, Response $response) {
        $response->getBody()->write('API is working!');
        return $response;
    });
    
    // CORS preflight
    $app->options('/{routes:.*}', function (Request $request, Response $response) {
      return $response;
    });
  
    // CORS middleware - must be added BEFORE routes
    $app->add(function ($request, $handler) {
      $response = $handler->handle($request);
      return $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    });

    // Player routes
    $app->post('/api/players', PlayerController::class . ':create');
    $app->get('/api/players/{id}', PlayerController::class . ':get');

    // Score routes
    $app->post('/api/scores', ScoreController::class . ':create');
    $app->get('/api/leaderboard', ScoreController::class . ':leaderboard');

    // Prize routes
    $app->get('/api/prizes/check', PrizeController::class . ':checkEligibility');
    $app->get('/api/prizes', PrizeController::class . ':getAll');

    // Vending routes
    $app->post('/api/vending/dispense', VendingController::class . ':dispense');
    $app->get('/api/vending/status', VendingController::class . ':status');
    $app->post('/api/vending/dispense-spring', VendingController::class . ':dispenseWithSpringSDK');
    $app->get('/api/vending/status-enhanced', VendingController::class . ':statusEnhanced');
    $app->get('/api/vending/diagnostics', VendingController::class . ':diagnostics');
    
    // Inventory routes
    $app->get('/api/inventory/slots', InventoryController::class . ':getSlots');
    $app->get('/api/inventory/slots/{tier}', InventoryController::class . ':getSlotsByTier');
    $app->get('/api/inventory/stats', InventoryController::class . ':getStatistics');
    $app->get('/api/inventory/slots-needing-refill', InventoryController::class . ':getSlotsNeedingRefill');
    $app->post('/api/inventory/slot/{slot}/increment', InventoryController::class . ':incrementSlot');
    $app->post('/api/inventory/reset', InventoryController::class . ':resetAllSlots');
    $app->post('/api/inventory/log-dispensing', InventoryController::class . ':logDispensing');
    $app->post('/api/inventory/log-out-of-stock', InventoryController::class . ':logOutOfStock');
    $app->get('/api/inventory/dispensing-logs', InventoryController::class . ':getDispensingLogs');
    $app->get('/api/inventory/out-of-stock-logs', InventoryController::class . ':getOutOfStockLogs');
    $app->get('/api/inventory/system-health', InventoryController::class . ':getSystemHealth');
};