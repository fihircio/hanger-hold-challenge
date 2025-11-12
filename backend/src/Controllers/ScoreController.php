<?php

namespace App\Controllers;

use App\Models\Score;
use App\Models\Player;
use App\Models\Prize;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class ScoreController extends BaseController
{
    public function create(Request $request, Response $response): Response
    {
        $data = $this->getRequestBody($request);
        
        // Validate required fields
        if (empty($data['player_id']) || empty($data['time'])) {
            return $this->errorResponse($response, 'Player ID and time are required');
        }
        
        try {
            // Verify player exists
            $player = Player::find($data['player_id']);
            if (!$player) {
                return $this->errorResponse($response, 'Player not found', 404);
            }
            
            // Check for prize eligibility
            $prize = Prize::findQualifyingPrize($data['time']);
            $prizeId = $prize ? $prize->id : null;
            
            // Create score
            $score = Score::create([
                'player_id' => $data['player_id'],
                'time' => $data['time'],
                'prize_id' => $prizeId,
                'dispensed' => false
            ]);
            
            // Return score with player and prize information
            $result = [
                'id' => $score->id,
                'player_id' => $score->player_id,
                'time' => $score->time,
                'prize' => $prize ? [
                    'id' => $prize->id,
                    'name' => $prize->name,
                    'message' => $prize->message,
                    'slot' => $prize->slot
                ] : null,
                'created_at' => $score->created_at
            ];
            
            return $this->jsonResponse($response, $result, 201);
            
        } catch (\Exception $e) {
            $this->logger->error('Error creating score: ' . $e->getMessage());
            return $this->errorResponse($response, 'Failed to create score', 500);
        }
    }
    
    public function leaderboard(Request $request, Response $response): Response
    {
        $limit = (int) $this->getQueryParam($request, 'limit', 10);
        $limit = min($limit, 100); // Cap at 100 for performance
        
        try {
            $scores = Score::with(['player', 'prize'])
                ->orderBy('time', 'desc')
                ->limit($limit)
                ->get();
            
            $leaderboard = $scores->map(function ($score) {
                return [
                    'id' => $score->id,
                    'name' => $score->player->name,
                    'email' => $score->player->email,
                    'phone' => $score->player->phone,
                    'time' => $score->time,
                    'prize' => $score->prize ? [
                        'name' => $score->prize->name,
                        'message' => $score->prize->message
                    ] : null,
                    'created_at' => $score->created_at
                ];
            });
            
            return $this->jsonResponse($response, [
                'scores' => $leaderboard->toArray(),
                'total' => $leaderboard->count()
            ]);
            
        } catch (\Exception $e) {
            $this->logger->error('Error getting leaderboard: ' . $e->getMessage());
            return $this->errorResponse($response, 'Failed to get leaderboard', 500);
        }
    }
}