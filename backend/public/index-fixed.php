<?php

use DI\Container;
use Slim\Factory\AppFactory;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0);

$basePath = dirname(__DIR__);
require_once $basePath . '/vendor/autoload.php';

try {
    // Load environment variables
    $dotenv = Dotenv\Dotenv::createImmutable($basePath);
    $dotenv->load();
} catch (Exception $e) {
    // If dotenv fails, continue without it
}

try {
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
    
    // Add error handling middleware with custom error handler
    $app->addErrorMiddleware(true, true, true);
    
    // Add custom error handler
    $errorMiddleware = function (
        Psr\Http\Message\ServerRequestInterface $request,
        Throwable $exception,
        bool $displayErrorDetails,
        bool $logErrors,
        bool $logErrorDetails = false
    ) use ($app, $container) {
        $response = $app->getResponseFactory()->createResponse();
        
        // Always return JSON response
        $response = $response->withHeader('Content-Type', 'application/json');
        
        $statusCode = 500;
        $errorData = [
            'error' => true,
            'message' => $exception->getMessage(),
            'code' => $exception->getCode(),
        ];
        
        // Handle specific error types
        if ($exception instanceof \Slim\Exception\HttpNotFoundException) {
            $statusCode = 404;
            $errorData['type'] = 'not_found';
        } elseif ($exception instanceof \Slim\Exception\HttpMethodNotAllowedException) {
            $statusCode = 405;
            $errorData['type'] = 'method_not_allowed';
        }
        
        $response = $response->withStatus($statusCode);
        $response->getBody()->write(json_encode($errorData));
        
        return $response;
    };
    
    $app->addErrorMiddleware($errorMiddleware);
    
    // Simple test route
    $app->get('/test', function (Request $request, Response $response) {
        $response->getBody()->write(json_encode(['message' => 'API is working!']));
        return $response->withHeader('Content-Type', 'application/json');
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
    
} catch (Throwable $e) {
    // Last resort error handler
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage(),
        'code' => $e->getCode()
    ]);
}