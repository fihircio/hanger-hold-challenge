<?php

namespace App\Controllers;

use App\Models\Player;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class PlayerController extends BaseController
{
    public function create(Request $request, Response $response): Response
    {
        $data = $this->getRequestBody($request);
        
        // Validate required fields
        if (empty($data['name'])) {
            return $this->errorResponse($response, 'Name is required');
        }
        
        try {
            // Check if player with email already exists
            if (!empty($data['email'])) {
                $existingPlayer = Player::where('email', $data['email'])->first();
                if ($existingPlayer) {
                    return $this->jsonResponse($response, [
                        'id' => $existingPlayer->id,
                        'name' => $existingPlayer->name,
                        'email' => $existingPlayer->email,
                        'phone' => $existingPlayer->phone,
                        'existing' => true
                    ]);
                }
            }
            
            // Create new player
            $player = Player::create([
                'name' => $data['name'],
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null
            ]);
            
            return $this->jsonResponse($response, [
                'id' => $player->id,
                'name' => $player->name,
                'email' => $player->email,
                'phone' => $player->phone,
                'existing' => false
            ], 201);
            
        } catch (\Exception $e) {
            $this->logger->error('Error creating player: ' . $e->getMessage());
            return $this->errorResponse($response, 'Failed to create player', 500);
        }
    }
    
    public function get(Request $request, Response $response): Response
    {
        $id = $request->getAttribute('id');
        
        try {
            $player = Player::find($id);
            
            if (!$player) {
                return $this->errorResponse($response, 'Player not found', 404);
            }
            
            return $this->jsonResponse($response, [
                'id' => $player->id,
                'name' => $player->name,
                'email' => $player->email,
                'phone' => $player->phone
            ]);
            
        } catch (\Exception $e) {
            $this->logger->error('Error getting player: ' . $e->getMessage());
            return $this->errorResponse($response, 'Failed to get player', 500);
        }
    }
}