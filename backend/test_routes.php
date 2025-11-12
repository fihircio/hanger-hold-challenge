<?php

use DI\Container;
use Slim\Factory\AppFactory;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

require_once __DIR__ . '/vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
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

// Register dependencies
require_once __DIR__ . '/src/dependencies.php';

// Register routes
$routesClosure = require_once __DIR__ . '/src/routes.php';
$routesClosure($app);

// Get all routes
$routeCollector = $app->getRouteCollector();
$routes = $routeCollector->getRoutes();

echo "Registered Routes:\n";
echo "=================\n\n";

foreach ($routes as $route) {
    $pattern = $route->getPattern();
    $methods = implode(', ', $route->getMethods());
    $callable = $route->getCallable();
    
    if (is_string($callable)) {
        echo "[$methods] $pattern -> $callable\n";
    } elseif (is_array($callable)) {
        echo "[$methods] $pattern -> " . get_class($callable[0]) . ':' . $callable[1] . "\n";
    } else {
        echo "[$methods] $pattern -> Closure\n";
    }
}

echo "\nTotal routes: " . count($routes) . "\n";