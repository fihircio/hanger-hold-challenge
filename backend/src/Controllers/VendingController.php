<?php

namespace App\Controllers;

use App\Models\VendingLog;
use App\Models\Score;
use App\Models\Prize;
use App\Services\SpringVendingLogger;
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
    
    /**
     * Enhanced prize dispensing using Spring SDK
     */
    public function dispenseWithSpringSDK(Request $request, Response $response): Response
    {
        $data = $this->getRequestBody($request);
        
        // Validate required fields
        if (empty($data['tier']) || empty($data['score_id'])) {
            return $this->errorResponse($response, 'Tier and score ID are required');
        }
        
        try {
            // Log dispensing attempt
            SpringVendingLogger::logDispensingAttempt($data['tier'], $data['score_id']);
            
            // Get Spring SDK service (this would be injected via dependency injection)
            $springService = $this->getSpringVendingService();
            
            if (!$springService) {
                // Fallback to legacy method
                return $this->dispense($request, $response);
            }
            
            // Use Spring SDK service for enhanced dispensing
            $result = $springService->dispenseByTier($data['tier'], $data['score_id']);
            
            // Log result
            if ($result['success']) {
                SpringVendingLogger::logDispensingSuccess($data['tier'], $result['channel']);
                
                // Update score with Spring SDK info
                $score = Score::find($data['score_id']);
                if ($score) {
                    $score->dispensed = true;
                    $score->dispensed_at = date('Y-m-d H:i:s');
                    $score->save();
                }
                
                // Create enhanced vending log
                $this->createSpringVendingLog($data['score_id'], $data['tier'], $result['channel'], true, null);
                
                return $this->jsonResponse($response, [
                    'success' => true,
                    'tier' => $data['tier'],
                    'channel' => $result['channel'],
                    'message' => "{$data['tier']} prize dispensed successfully via Spring SDK",
                    'spring_sdk_used' => true
                ]);
            } else {
                SpringVendingLogger::logDispensingFailure($data['tier'], $result['error']);
                
                // Create enhanced vending log
                $this->createSpringVendingLog($data['score_id'], $data['tier'], $result['channel'], false, $result['error']);
                
                return $this->jsonResponse($response, [
                    'success' => false,
                    'tier' => $data['tier'],
                    'error' => $result['error'],
                    'message' => "Failed to dispense {$data['tier']} prize via Spring SDK",
                    'spring_sdk_used' => true
                ]);
            }
            
        } catch (\Exception $e) {
            SpringVendingLogger::logError('Spring SDK dispensing error: ' . $e->getMessage());
            return $this->errorResponse($response, 'Failed to dispense prize via Spring SDK', 500);
        }
    }
    
    /**
     * Create enhanced vending log entry
     */
    private function createSpringVendingLog(int $scoreId, string $tier, int $channel, bool $success, ?string $error): void
    {
        VendingLog::create([
            'score_id' => $scoreId,
            'prize_id' => $this->getPrizeIdByTier($tier),
            'slot' => $channel,
            'command' => 'spring_sdk_dispense',
            'response' => $success ? 'success' : 'failed',
            'success' => $success,
            'error_message' => $error,
            'spring_channel' => $channel,
            'spring_tier' => $tier,
            'spring_success' => $success,
            'source' => 'spring_sdk',
            'created_at' => date('Y-m-d H:i:s')
        ]);
    }
    
    /**
     * Get prize ID by tier
     */
    private function getPrizeIdByTier(string $tier): ?int
    {
        switch ($tier) {
            case 'gold':
                return 1; // Gold prize ID
            case 'silver':
                return 2; // Silver prize ID
            case 'bronze':
                return 3; // Bronze prize ID
            default:
                return null;
        }
    }
    
    /**
     * Get Spring SDK service instance
     */
    private function getSpringVendingService()
    {
        // This would be injected via dependency injection in a real application
        // For now, return null to trigger fallback
        return null;
    }
    
    /**
     * Enhanced vending status with Spring SDK information
     */
    public function statusEnhanced(Request $request, Response $response): Response
    {
        try {
            // Get recent vending logs including Spring SDK logs
            $recentLogs = VendingLog::with(['prize', 'score.player'])
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();
            
            $logs = $recentLogs->map(function ($log) {
                return [
                    'id' => $log->id,
                    'prize_name' => $log->prize->name ?? 'Unknown',
                    'player_name' => $log->score->player->name ?? 'Unknown',
                    'slot' => $log->slot,
                    'success' => $log->success,
                    'error_message' => $log->error_message,
                    'spring_channel' => $log->spring_channel,
                    'spring_tier' => $log->spring_tier,
                    'spring_success' => $log->spring_success,
                    'source' => $log->source,
                    'created_at' => $log->created_at
                ];
            });
            
            // Get Spring SDK specific logs
            $springLogs = SpringVendingLogger::getRecentLogs(5);
            
            // Calculate system health
            $totalLogs = VendingLog::count();
            $successfulLogs = VendingLog::where('success', true)->count();
            $successRate = $totalLogs > 0 ? round(($successfulLogs / $totalLogs) * 100, 2) : 0;
            
            // Get Spring SDK specific stats
            $springTotalLogs = VendingLog::where('source', 'spring_sdk')->count();
            $springSuccessfulLogs = VendingLog::where('source', 'spring_sdk')->where('spring_success', true)->count();
            $springSuccessRate = $springTotalLogs > 0 ? round(($springSuccessfulLogs / $springTotalLogs) * 100, 2) : 0;
            
            return $this->jsonResponse($response, [
                'status' => 'operational',
                'success_rate' => $successRate,
                'spring_sdk' => [
                    'enabled' => true,
                    'total_logs' => $springTotalLogs,
                    'success_rate' => $springSuccessRate,
                    'recent_logs' => $springLogs
                ],
                'recent_logs' => $logs->toArray(),
                'system_health' => [
                    'total_operations' => $totalLogs,
                    'successful_operations' => $successfulLogs,
                    'success_rate_percentage' => $successRate
                ]
            ]);
            
        } catch (\Exception $e) {
            $this->logger->error('Error getting enhanced vending status: ' . $e->getMessage());
            return $this->errorResponse($response, 'Failed to get enhanced vending status', 500);
        }
    }
    
    /**
     * System diagnostics endpoint
     */
    public function diagnostics(Request $request, Response $response): Response
    {
        try {
            // Include the VendingDiagnostics service
            if (!class_exists('App\Services\VendingDiagnostics')) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'VendingDiagnostics service not available'
                ]);
            }
            
            $diagnostics = new \App\Services\VendingDiagnostics();
            $results = $diagnostics->runFullDiagnostics();
            
            return $this->jsonResponse($response, [
                'success' => true,
                'diagnostics' => $results,
                'timestamp' => date('Y-m-d H:i:s')
            ]);
            
        } catch (\Exception $e) {
            $this->logger->error('Error running diagnostics: ' . $e->getMessage());
            return $this->errorResponse($response, 'Failed to run diagnostics', 500);
        }
    }
}