<?php

namespace App\Models;

class VendingLog extends BaseModel
{
    protected $table = 'vending_logs';
    
    protected $fillable = [
        'score_id',
        'prize_id',
        'slot',
        'command',
        'response',
        'success',
        'error_message',
        'spring_channel',
        'spring_error_code',
        'spring_error_message',
        'spring_tier',
        'spring_success',
        'source'
    ];
    
    protected $casts = [
        'score_id' => 'integer',
        'prize_id' => 'integer',
        'slot' => 'integer',
        'success' => 'boolean'
    ];
    
    public function score()
    {
        return $this->belongsTo(Score::class);
    }
    
    public function prize()
    {
        return $this->belongsTo(Prize::class);
    }
}