<?php

use DI\Container;
use Slim\Factory\AppFactory;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

$basePath = dirname(__DIR__);
require_once $basePath . '/vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable($basePath);
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

// Add error handling middleware
$app->addErrorMiddleware(true, true, true);

// Simple test route
$app->get('/test', function (Request $request, Response $response) {
    $response->getBody()->write('API is working!');
    return $response;
});

// Simple API routes
$app->get('/api/leaderboard', function (Request $request, Response $response) {
    $response->getBody()->write(json_encode(['scores' => [], 'total' => 0]));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->post('/api/players', function (Request $request, Response $response) {
    $response->getBody()->write(json_encode(['id' => 1, 'name' => 'Test Player']));
    return $response->withHeader('Content-Type', 'application/json');
});

// Run app
$app->run();