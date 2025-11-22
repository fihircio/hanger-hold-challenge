<?php

namespace App\Models;

class SlotInventory extends BaseModel
{
    protected $table = 'slot_inventory';
    
    protected $fillable = [
        'slot',
        'tier',
        'dispense_count',
        'max_dispenses',
        'last_dispensed_at',
        'updated_at'
    ];
    
    protected $casts = [
        'slot' => 'integer',
        'dispense_count' => 'integer',
        'max_dispenses' => 'integer',
        'last_dispensed_at' => 'datetime',
        'updated_at' => 'datetime'
    ];
    
    /**
     * Get slot by number
     */
    public static function getBySlot(int $slot): ?self
    {
        return self::where('slot', $slot)->first();
    }
    
    /**
     * Get slots by tier
     */
    public static function getByTier(string $tier): \Illuminate\Database\Eloquent\Collection
    {
        return self::where('tier', $tier)->get();
    }
    
    /**
     * Get slots needing refill
     */
    public static function getNeedingRefill(float $threshold = 0.8): \Illuminate\Database\Eloquent\Collection
    {
        $thresholdCount = floor(5 * $threshold);
        return self::where('dispense_count', '>=', $thresholdCount)->get();
    }
    
    /**
     * Reset all slot counts
     */
    public static function resetAllCounts(): int
    {
        return self::query()->update([
            'dispense_count' => 0,
            'last_dispensed_at' => null,
            'updated_at' => now()
        ]);
    }
    
    /**
     * Increment slot count
     */
    public function incrementCount(): self
    {
        $this->dispense_count = min($this->dispense_count + 1, $this->max_dispenses);
        $this->last_dispensed_at = now();
        $this->updated_at = now();
        $this->save();
        
        return $this;
    }
    
    /**
     * Check if slot needs refill
     */
    public function needsRefill(float $threshold = 0.8): bool
    {
        return $this->dispense_count >= ($this->max_dispenses * $threshold);
    }
    
    /**
     * Get usage percentage
     */
    public function getUsagePercentage(): float
    {
        return $this->max_dispenses > 0 ? 
            round(($this->dispense_count / $this->max_dispenses) * 100, 1) : 0;
    }
    
    /**
     * Check if slot is empty
     */
    public function isEmpty(): bool
    {
        return $this->dispense_count >= $this->max_dispenses;
    }
    
    /**
     * Get remaining capacity
     */
    public function getRemainingCapacity(): int
    {
        return max(0, $this->max_dispenses - $this->dispense_count);
    }
}