<?php

namespace App\Models;

class Score extends BaseModel
{
    protected $table = 'scores';
    
    protected $fillable = [
        'player_id',
        'time',
        'prize_id',
        'dispensed'
    ];
    
    protected $casts = [
        'time' => 'integer',
        'prize_id' => 'integer',
        'dispensed' => 'boolean'
    ];
    
    public function player()
    {
        return $this->belongsTo(Player::class);
    }
    
    public function prize()
    {
        return $this->belongsTo(Prize::class);
    }
    
    public function vendingLogs()
    {
        return $this->hasMany(VendingLog::class);
    }
}