<?php

namespace App\Models;

class OutOfStockLog extends BaseModel
{
    protected $table = 'out_of_stock_logs';
    
    protected $fillable = [
        'tier',
        'timestamp',
        'source'
    ];
    
    protected $casts = [
        'timestamp' => 'datetime'
    ];
    
    /**
     * Get recent logs
     */
    public static function getRecent(int $limit = 20): \Illuminate\Database\Eloquent\Collection
    {
        return self::orderBy('created_at', 'desc')->limit($limit)->get();
    }
    
    /**
     * Get logs by tier
     */
    public static function getByTier(string $tier, int $limit = 20): \Illuminate\Database\Eloquent\Collection
    {
        return self::where('tier', $tier)
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
     * Count occurrences by tier
     */
    public static function countByTier(string $tier): int
    {
        return self::where('tier', $tier)->count();
    }
    
    /**
     * Get most recent out of stock for each tier
     */
    public static function getMostRecentByTier(): array
    {
        $goldLog = self::where('tier', 'gold')
            ->orderBy('created_at', 'desc')
            ->first();
            
        $silverLog = self::where('tier', 'silver')
            ->orderBy('created_at', 'desc')
            ->first();
            
        return [
            'gold' => $goldLog ? [
                'timestamp' => $goldLog->timestamp,
                'created_at' => $goldLog->created_at
            ] : null,
            'silver' => $silverLog ? [
                'timestamp' => $silverLog->timestamp,
                'created_at' => $silverLog->created_at
            ] : null
        ];
    }
}