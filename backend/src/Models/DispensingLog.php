<?php

namespace App\Models;

class DispensingLog extends BaseModel
{
    protected $table = 'dispensing_logs';
    
    protected $fillable = [
        'slot',
        'tier',
        'success',
        'error',
        'timestamp',
        'source'
    ];
    
    protected $casts = [
        'slot' => 'integer',
        'success' => 'boolean',
        'timestamp' => 'datetime'
    ];
    
    /**
     * Get recent logs
     */
    public static function getRecent(int $limit = 50): \Illuminate\Database\Eloquent\Collection
    {
        return self::orderBy('created_at', 'desc')->limit($limit)->get();
    }
    
    /**
     * Get logs by tier
     */
    public static function getByTier(string $tier, int $limit = 50): \Illuminate\Database\Eloquent\Collection
    {
        return self::where('tier', $tier)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
    
    /**
     * Get successful logs
     */
    public static function getSuccessful(int $limit = 50): \Illuminate\Database\Eloquent\Collection
    {
        return self::where('success', true)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
    
    /**
     * Get failed logs
     */
    public static function getFailed(int $limit = 50): \Illuminate\Database\Eloquent\Collection
    {
        return self::where('success', false)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
    
    /**
     * Get logs by date range
     */
    public static function getByDateRange(string $startDate, string $endDate): \Illuminate\Database\Eloquent\Collection
    {
        return self::whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('created_at', 'desc')
            ->get();
    }
    
    /**
     * Get success rate for a time period
     */
    public static function getSuccessRate(string $startDate = null, string $endDate = null): float
    {
        $query = self::query();
        
        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }
        
        $totalLogs = $query->count();
        
        if ($totalLogs === 0) {
            return 0.0;
        }
        
        $successfulLogs = $query->where('success', true)->count();
        
        return round(($successfulLogs / $totalLogs) * 100, 1);
    }
    
    /**
     * Get error summary
     */
    public static function getErrorSummary(int $limit = 20): array
    {
        $errors = self::where('success', false)
            ->whereNotNull('error')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
        
        $errorSummary = [];
        
        foreach ($errors as $error) {
            $errorMessage = $error->error;
            if (!isset($errorSummary[$errorMessage])) {
                $errorSummary[$errorMessage] = [
                    'message' => $errorMessage,
                    'count' => 1,
                    'first_occurrence' => $error->created_at,
                    'last_occurrence' => $error->created_at
                ];
            } else {
                $errorSummary[$errorMessage]['count']++;
                $errorSummary[$errorMessage]['last_occurrence'] = $error->created_at;
            }
        }
        
        return $errorSummary;
    }
}