<?php

namespace App\Controllers;

use Psr\Container\ContainerInterface;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

abstract class BaseController
{
    protected $container;
    protected $db;
    protected $logger;

    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
        $this->db = $container->get('db');
        $this->logger = $container->get('logger');
    }

    protected function jsonResponse(Response $response, $data, int $status = 200): Response
    {
        $response->getBody()->write(json_encode($data));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }

    protected function errorResponse(Response $response, string $message, int $status = 400): Response
    {
        return $this->jsonResponse($response, [
            'error' => true,
            'message' => $message
        ], $status);
    }

    protected function getRequestBody(Request $request): array
    {
        return $request->getParsedBody() ?? [];
    }

    protected function getQueryParam(Request $request, string $key, $default = null)
    {
        $params = $request->getQueryParams();
        return $params[$key] ?? $default;
    }
}