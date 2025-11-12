<?php

namespace App\Models;

class Prize extends BaseModel
{
    protected $table = 'prizes';
    
    protected $fillable = [
        'name',
        'message',
        'slot',
        'time_threshold',
        'active'
    ];
    
    protected $casts = [
        'slot' => 'integer',
        'time_threshold' => 'integer',
        'active' => 'boolean'
    ];
    
    public function scores()
    {
        return $this->hasMany(Score::class);
    }
    
    public function vendingLogs()
    {
        return $this->hasMany(VendingLog::class);
    }
    
    /**
     * Check if a time qualifies for this prize
     */
    public function qualifies(int $time): bool
    {
        return $this->active && $time >= $this->time_threshold;
    }
    
    /**
     * Find the highest tier prize that qualifies for the given time
     */
    public static function findQualifyingPrize(int $time): ?Prize
    {
        return static::where('active', true)
            ->where('time_threshold', '<=', $time)
            ->orderBy('time_threshold', 'desc')
            ->first();
    }
}