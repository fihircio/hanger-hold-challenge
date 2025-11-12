<?php

namespace App\Controllers;

use App\Models\VendingLog;
use App\Models\Score;
use App\Models\Prize;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class VendingController extends BaseController
{
    /**
     * Constructs the 6-byte HEX command for vending
     */
    private function constructVendCommand(int $slotNumber): string
    {
        if ($slotNumber < 1 || $slotNumber > 80) {
            throw new \InvalidArgumentException('Slot number must be between 1 and 80.');
        }

        $command = new \SplFixedArray(6);
        $command[0] = 0x00;
        $command[1] = 0xFF;
        $command[2] = $slotNumber;
        $command[3] = 0xFF - $slotNumber;
        $command[4] = 0xAA;
        $command[5] = 0x55;

        $hexCommand = '';
        foreach ($command as $byte) {
            $hexCommand .= sprintf('%02X ', $byte);
        }
        
        return trim($hexCommand);
    }
    
    /**
     * Simulates sending command to vending machine
     * In production, this would interface with actual hardware
     */
    private function sendVendCommand(int $slotNumber): array
    {
        try {
            $command = $this->constructVendCommand($slotNumber);
            
            // Log the command
            $this->logger->info("Sending vending command for slot {$slotNumber}: {$command}");
            
            // Simulate delay for command processing
            usleep(1500000); // 1.5 seconds
            
            // Simulate successful response
            $response = '00 5D 00 AA 07'; // Success response
            
            $this->logger->info("Vending response received: {$response}");
            
            return [
                'success' => true,
                'command' => $command,
                'response' => $response
            ];
            
        } catch (\Exception $e) {
            $this->logger->error("Vending error: " . $e->getMessage());
            return [
                'success' => false,
                'command' => $command ?? null,
                'response' => null,
                'error' => $e->getMessage()
            ];
        }
    }
    
    public function dispense(Request $request, Response $response): Response
    {
        $data = $this->getRequestBody($request);
        
        // Validate required fields
        if (empty($data['prize_id']) || empty($data['score_id'])) {
            return $this->errorResponse($response, 'Prize ID and Score ID are required');
        }
        
        try {
            // Verify score exists
            $score = Score::find($data['score_id']);
            if (!$score) {
                return $this->errorResponse($response, 'Score not found', 404);
            }
            
            // Verify prize exists
            $prize = Prize::find($data['prize_id']);
            if (!$prize) {
                return $this->errorResponse($response, 'Prize not found', 404);
            }
            
            // Check if already dispensed
            if ($score->dispensed) {
                return $this->errorResponse($response, 'Prize already dispensed for this score');
            }
            
            // Send vending command
            $vendingResult = $this->sendVendCommand($prize->slot);
            
            // Log the vending operation
            $vendingLog = VendingLog::create([
                'score_id' => $score->id,
                'prize_id' => $prize->id,
                'slot' => $prize->slot,
                'command' => $vendingResult['command'],
                'response' => $vendingResult['response'],
                'success' => $vendingResult['success'],
                'error_message' => $vendingResult['error'] ?? null
            ]);
            
            // Update score if successful
            if ($vendingResult['success']) {
                $score->dispensed = true;
                $score->prize_id = $prize->id;
                $score->save();
            }
            
            return $this->jsonResponse($response, [
                'success' => $vendingResult['success'],
                'score_id' => $score->id,
                'prize_id' => $prize->id,
                'prize_name' => $prize->name,
                'slot' => $prize->slot,
                'command' => $vendingResult['command'],
                'response' => $vendingResult['response'],
                'error' => $vendingResult['error'] ?? null,
                'log_id' => $vendingLog->id
            ]);
            
        } catch (\Exception $e) {
            $this->logger->error('Error dispensing prize: ' . $e->getMessage());
            return $this->errorResponse($response, 'Failed to dispense prize', 500);
        }
    }
    
    public function status(Request $request, Response $response): Response
    {
        try {
            // Get recent vending logs
            $recentLogs = VendingLog::with(['prize', 'score.player'])
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();
            
            $logs = $recentLogs->map(function ($log) {
                return [
                    'id' => $log->id,
                    'prize_name' => $log->prize->name,
                    'player_name' => $log->score->player->name,
                    'slot' => $log->slot,
                    'success' => $log->success,
                    'error_message' => $log->error_message,
                    'created_at' => $log->created_at
                ];
            });
            
            return $this->jsonResponse($response, [
                'status' => 'operational',
                'recent_logs' => $logs->toArray()
            ]);
            
        } catch (\Exception $e) {
            $this->logger->error('Error getting vending status: ' . $e->getMessage());
            return $this->errorResponse($response, 'Failed to get vending status', 500);
        }
    }
}