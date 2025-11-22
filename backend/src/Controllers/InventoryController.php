<?php

namespace App\Controllers;

use App\Models\SlotInventory;
use App\Models\DispensingLog;
use App\Models\OutOfStockLog;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class InventoryController extends BaseController
{
    /**
     * Get all slot inventory
     */
    public function getSlots(Request $request, Response $response): Response
    {
        try {
            $slots = SlotInventory::with(['tier'])->orderBy('slot')->get();
            
            $slotsArray = $slots->map(function ($slot) {
                return [
                    'slot' => $slot->slot,
                    'tier' => $slot->tier,
                    'dispense_count' => $slot->dispense_count,
                    'max_dispenses' => $slot->max_dispenses,
                    'last_dispensed_at' => $slot->last_dispensed_at,
                    'updated_at' => $slot->updated_at,
                    'usage_percentage' => $slot->max_dispenses > 0 ? 
                        round(($slot->dispense_count / $slot->max_dispenses) * 100, 1) : 0,
                    'needs_refill' => $slot->dispense_count >= ($slot->max_dispenses * 0.8)
                ];
            });
            
            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $slotsArray,
                'total_slots' => count($slotsArray)
            ]);
            
        } catch (\Exception $e) {
            $this->logger->error('Error getting slot inventory: ' . $e->getMessage());
            return $this->errorResponse($response, 'Failed to get slot inventory', 500);
        }
    }
    
    /**
     * Get slots by tier
     */
    public function getSlotsByTier(Request $request, Response $response): Response
    {
        try {
            $tier = $request->getAttribute('tier');
            
            if (!in_array($tier, ['gold', 'silver'])) {
                return $this->errorResponse($response, 'Invalid tier. Must be gold or silver', 400);
            }
            
            $slots = SlotInventory::where('tier', $tier)
                ->orderBy('slot')
                ->get();
            
            $slotsArray = $slots->map(function ($slot) {
                return [
                    'slot' => $slot->slot,
                    'tier' => $slot->tier,
                    'dispense_count' => $slot->dispense_count,
                    'max_dispenses' => $slot->max_dispenses,
                    'usage_percentage' => $slot->max_dispenses > 0 ? 
                        round(($slot->dispense_count / $slot->max_dispenses) * 100, 1) : 0,
                    'needs_refill' => $slot->dispense_count >= ($slot->max_dispenses * 0.8)
                ];
            });
            
            return $this->jsonResponse($response, [
                'success' => true,
                'tier' => $tier,
                'data' => $slotsArray,
                'total_tier_slots' => count($slotsArray)
            ]);
            
        } catch (\Exception $e) {
            $this->logger->error('Error getting slots by tier: ' . $e->getMessage());
            return $this->errorResponse($response, 'Failed to get slots by tier', 500);
        }
    }
    
    /**
     * Get inventory statistics
     */
    public function getStatistics(Request $request, Response $response): Response
    {
        try {
            $allSlots = SlotInventory::all();
            
            $goldSlots = $allSlots->where('tier', 'gold')->count();
            $silverSlots = $allSlots->where('tier', 'silver')->count();
            $totalSlots = $goldSlots + $silverSlots;
            
            $totalDispensed = $allSlots->sum('dispense_count');
            $goldDispensed = $allSlots->where('tier', 'gold')->sum('dispense_count');
            $silverDispensed = $allSlots->where('tier', 'silver')->sum('dispense_count');
            
            $emptySlots = $allSlots->where('dispense_count', '>=', 5)->count();
            $slotsNeedingRefill = $allSlots->where('dispense_count', '>=', 4)->count(); // 80% threshold
            
            $statistics = [
                'total_slots' => $totalSlots,
                'gold_slots' => $goldSlots,
                'silver_slots' => $silverSlots,
                'total_dispensed' => $totalDispensed,
                'gold_dispensed' => $goldDispensed,
                'silver_dispensed' => $silverDispensed,
                'empty_slots' => $emptySlots,
                'slots_needing_refill' => $slotsNeedingRefill,
                'overall_usage_percentage' => $totalSlots > 0 ? 
                    round(($totalDispensed / ($totalSlots * 5)) * 100, 1) : 0,
                'gold_usage_percentage' => $goldSlots > 0 ? 
                    round(($goldDispensed / ($goldSlots * 5)) * 100, 1) : 0,
                'silver_usage_percentage' => $silverSlots > 0 ? 
                    round(($silverDispensed / ($silverSlots * 5)) * 100, 1) : 0
            ];
            
            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $statistics
            ]);
            
        } catch (\Exception $e) {
            $this->logger->error('Error getting statistics: ' . $e->getMessage());
            return $this->errorResponse($response, 'Failed to get statistics', 500);
        }
    }
    
    /**
     * Get slots needing refill
     */
    public function getSlotsNeedingRefill(Request $request, Response $response): Response
    {
        try {
            $threshold = $request->getAttribute('threshold') ?? 0.8;
            $thresholdCount = floor(5 * $threshold);
            
            $slots = SlotInventory::where('dispense_count', '>=', $thresholdCount)
                ->orderBy('slot')
                ->get();
            
            $slotsArray = $slots->map(function ($slot) {
                return [
                    'slot' => $slot->slot,
                    'tier' => $slot->tier,
                    'dispense_count' => $slot->dispense_count,
                    'max_dispenses' => $slot->max_dispenses,
                    'usage_percentage' => round(($slot->dispense_count / $slot->max_dispenses) * 100, 1)
                ];
            });
            
            return $this->jsonResponse($response, [
                'success' => true,
                'threshold' => $threshold,
                'threshold_count' => $thresholdCount,
                'data' => $slotsArray,
                'total_slots_needing_refill' => count($slotsArray)
            ]);
            
        } catch (\Exception $e) {
            $this->logger->error('Error getting slots needing refill: ' . $e->getMessage());
            return $this->errorResponse($response, 'Failed to get slots needing refill', 500);
        }
    }
    
    /**
     * Increment specific slot count
     */
    public function incrementSlot(Request $request, Response $response): Response
    {
        try {
            $data = $this->getRequestBody($request);
            $slot = $data['slot'] ?? null;
            
            if ($slot === null || !is_numeric($slot)) {
                return $this->errorResponse($response, 'Valid slot number is required', 400);
            }
            
            $slotInventory = SlotInventory::where('slot', $slot)->first();
            
            if (!$slotInventory) {
                return $this->errorResponse($response, 'Slot not found', 404);
            }
            
            if ($slotInventory->dispense_count >= $slotInventory->max_dispenses) {
                return $this->errorResponse($response, 'Slot already at maximum capacity', 400);
            }
            
            $slotInventory->dispense_count += 1;
            $slotInventory->last_dispensed_at = date('Y-m-d H:i:s');
            $slotInventory->updated_at = date('Y-m-d H:i:s');
            $slotInventory->save();
            
            return $this->jsonResponse($response, [
                'success' => true,
                'message' => "Slot {$slot} incremented successfully",
                'data' => [
                    'slot' => $slotInventory->slot,
                    'tier' => $slotInventory->tier,
                    'dispense_count' => $slotInventory->dispense_count,
                    'max_dispenses' => $slotInventory->max_dispenses,
                    'usage_percentage' => round(($slotInventory->dispense_count / $slotInventory->max_dispenses) * 100, 1)
                ]
            ]);
            
        } catch (\Exception $e) {
            $this->logger->error('Error incrementing slot: ' . $e->getMessage());
            return $this->errorResponse($response, 'Failed to increment slot', 500);
        }
    }
    
    /**
     * Reset all slot counts
     */
    public function resetAllSlots(Request $request, Response $response): Response
    {
        try {
            $slots = SlotInventory::all();
            
            foreach ($slots as $slot) {
                $slot->dispense_count = 0;
                $slot->last_dispensed_at = null;
                $slot->updated_at = date('Y-m-d H:i:s');
                $slot->save();
            }
            
            $this->logger->info('All slot counts reset to zero');
            
            return $this->jsonResponse($response, [
                'success' => true,
                'message' => 'All slot counts reset successfully',
                'total_slots_reset' => count($slots)
            ]);
            
        } catch (\Exception $e) {
            $this->logger->error('Error resetting slot counts: ' . $e->getMessage());
            return $this->errorResponse($response, 'Failed to reset slot counts', 500);
        }
    }
    
    /**
     * Log dispensing information
     */
    public function logDispensing(Request $request, Response $response): Response
    {
        try {
            $data = $this->getRequestBody($request);
            
            $requiredFields = ['slot', 'tier', 'success', 'timestamp', 'source'];
            foreach ($requiredFields as $field) {
                if (empty($data[$field])) {
                    return $this->errorResponse($response, "Missing required field: {$field}", 400);
                }
            }
            
            // Create dispensing log entry
            $dispensingLog = DispensingLog::create([
                'slot' => $data['slot'],
                'tier' => $data['tier'],
                'success' => $data['success'],
                'error' => $data['error'] ?? null,
                'timestamp' => $data['timestamp'],
                'source' => $data['source']
            ]);
            
            return $this->jsonResponse($response, [
                'success' => true,
                'message' => 'Dispensing log recorded successfully',
                'data' => [
                    'log_id' => $dispensingLog->id,
                    'slot' => $dispensingLog->slot,
                    'tier' => $dispensingLog->tier,
                    'success' => $dispensingLog->success,
                    'error' => $dispensingLog->error,
                    'timestamp' => $dispensingLog->timestamp,
                    'source' => $dispensingLog->source
                ]
            ]);
            
        } catch (\Exception $e) {
            $this->logger->error('Error logging dispensing: ' . $e->getMessage());
            return $this->errorResponse($response, 'Failed to log dispensing', 500);
        }
    }
    
    /**
     * Log out of stock situation
     */
    public function logOutOfStock(Request $request, Response $response): Response
    {
        try {
            $data = $this->getRequestBody($request);
            
            $requiredFields = ['tier', 'timestamp', 'source'];
            foreach ($requiredFields as $field) {
                if (empty($data[$field])) {
                    return $this->errorResponse($response, "Missing required field: {$field}", 400);
                }
            }
            
            // Create out of stock log entry
            $outOfStockLog = OutOfStockLog::create([
                'tier' => $data['tier'],
                'timestamp' => $data['timestamp'],
                'source' => $data['source']
            ]);
            
            return $this->jsonResponse($response, [
                'success' => true,
                'message' => 'Out of stock log recorded successfully',
                'data' => [
                    'log_id' => $outOfStockLog->id,
                    'tier' => $outOfStockLog->tier,
                    'timestamp' => $outOfStockLog->timestamp,
                    'source' => $outOfStockLog->source
                ]
            ]);
            
        } catch (\Exception $e) {
            $this->logger->error('Error logging out of stock: ' . $e->getMessage());
            return $this->errorResponse($response, 'Failed to log out of stock', 500);
        }
    }
    
    /**
     * Get recent dispensing logs
     */
    public function getDispensingLogs(Request $request, Response $response): Response
    {
        try {
            $limit = $request->getAttribute('limit') ?? 50;
            $tier = $request->getAttribute('tier');
            
            $query = DispensingLog::with(['slotInventory'])->orderBy('created_at', 'desc');
            
            if ($tier) {
                $query->whereHas('tier', $tier);
            }
            
            $logs = $query->limit($limit)->get();
            
            $logsArray = $logs->map(function ($log) {
                return [
                    'id' => $log->id,
                    'slot' => $log->slot,
                    'tier' => $log->tier,
                    'success' => $log->success,
                    'error' => $log->error,
                    'timestamp' => $log->timestamp,
                    'source' => $log->source,
                    'created_at' => $log->created_at
                ];
            });
            
            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $logsArray,
                'total_logs' => count($logsArray),
                'limit' => $limit,
                'tier_filter' => $tier
            ]);
            
        } catch (\Exception $e) {
            $this->logger->error('Error getting dispensing logs: ' . $e->getMessage());
            return $this->errorResponse($response, 'Failed to get dispensing logs', 500);
        }
    }
    
    /**
     * Get recent out of stock logs
     */
    public function getOutOfStockLogs(Request $request, Response $response): Response
    {
        try {
            $limit = $request->getAttribute('limit') ?? 20;
            $tier = $request->getAttribute('tier');
            
            $query = OutOfStockLog::orderBy('created_at', 'desc');
            
            if ($tier) {
                $query->where('tier', $tier);
            }
            
            $logs = $query->limit($limit)->get();
            
            $logsArray = $logs->map(function ($log) {
                return [
                    'id' => $log->id,
                    'tier' => $log->tier,
                    'timestamp' => $log->timestamp,
                    'source' => $log->source,
                    'created_at' => $log->created_at
                ];
            });
            
            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $logsArray,
                'total_logs' => count($logsArray),
                'limit' => $limit,
                'tier_filter' => $tier
            ]);
            
        } catch (\Exception $e) {
            $this->logger->error('Error getting out of stock logs: ' . $e->getMessage());
            return $this->errorResponse($response, 'Failed to get out of stock logs', 500);
        }
    }
    
    /**
     * Get system health status
     */
    public function getSystemHealth(Request $request, Response $response): Response
    {
        try {
            $allSlots = SlotInventory::all();
            $totalSlots = $allSlots->count();
            
            $emptySlots = $allSlots->where('dispense_count', '>=', 5)->count();
            $criticalSlots = $allSlots->where('dispense_count', '>=', 4)->count(); // 80% threshold
            
            $recentLogs = DispensingLog::orderBy('created_at', 'desc')->limit(10)->get();
            $recentFailures = $recentLogs->where('success', false)->count();
            
            $health = [
                'total_slots' => $totalSlots,
                'empty_slots' => $emptySlots,
                'critical_slots' => $criticalSlots,
                'operational_slots' => $totalSlots - $emptySlots,
                'health_status' => $criticalSlots > 0 ? 'warning' : 'healthy',
                'recent_failures' => $recentFailures,
                'success_rate' => count($recentLogs) > 0 ? 
                    round(((count($recentLogs) - $recentFailures) / count($recentLogs)) * 100, 1) : 100
            ];
            
            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $health,
                'timestamp' => date('Y-m-d H:i:s')
            ]);
            
        } catch (\Exception $e) {
            $this->logger->error('Error getting system health: ' . $e->getMessage());
            return $this->errorResponse($response, 'Failed to get system health', 500);
        }
    }
}