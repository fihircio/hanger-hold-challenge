<?php

use DI\Container;
use Slim\Factory\AppFactory;
use Selective\BasePath\BasePathMiddleware;
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

// Set base path BEFORE adding other middleware
$app->setBasePath('');

// Add routing middleware
$app->addRoutingMiddleware();

// Add body parsing middleware
$app->addBodyParsingMiddleware();

// Add simple error handling middleware
$app->addErrorMiddleware(true, true, true);

// Register dependencies
$dependencies = require_once __DIR__ . '/../src/dependencies.php';
foreach ($dependencies as $key => $definition) {
    $container->set($key, $definition);
}

// Register routes
$routesClosure = require_once __DIR__ . '/../src/routes.php';
$routesClosure($app);

// Run app
$app->run();