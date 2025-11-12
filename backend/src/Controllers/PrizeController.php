<?php

namespace App\Controllers;

use App\Models\Prize;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class PrizeController extends BaseController
{
    public function checkEligibility(Request $request, Response $response): Response
    {
        $time = (int) $this->getQueryParam($request, 'time', 0);
        
        if ($time <= 0) {
            return $this->errorResponse($response, 'Time parameter is required and must be positive');
        }
        
        try {
            $prize = Prize::findQualifyingPrize($time);
            
            if (!$prize) {
                return $this->jsonResponse($response, [
                    'eligible' => false,
                    'message' => 'No prize eligible for this time'
                ]);
            }
            
            return $this->jsonResponse($response, [
                'eligible' => true,
                'prize' => [
                    'id' => $prize->id,
                    'name' => $prize->name,
                    'message' => $prize->message,
                    'slot' => $prize->slot,
                    'time_threshold' => $prize->time_threshold
                ]
            ]);
            
        } catch (\Exception $e) {
            $this->logger->error('Error checking prize eligibility: ' . $e->getMessage());
            return $this->errorResponse($response, 'Failed to check prize eligibility', 500);
        }
    }
    
    public function getAll(Request $request, Response $response): Response
    {
        try {
            $prizes = Prize::where('active', true)
                ->orderBy('time_threshold', 'desc')
                ->get();
            
            $prizeList = $prizes->map(function ($prize) {
                return [
                    'id' => $prize->id,
                    'name' => $prize->name,
                    'message' => $prize->message,
                    'slot' => $prize->slot,
                    'time_threshold' => $prize->time_threshold
                ];
            });
            
            return $this->jsonResponse($response, [
                'prizes' => $prizeList->toArray()
            ]);
            
        } catch (\Exception $e) {
            $this->logger->error('Error getting prizes: ' . $e->getMessage());
            return $this->errorResponse($response, 'Failed to get prizes', 500);
        }
    }
}