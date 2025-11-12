<?php

namespace App\Models;

class Player extends BaseModel
{
    protected $table = 'players';
    
    protected $fillable = [
        'name',
        'email',
        'phone'
    ];
    
    protected $hidden = [
        'created_at',
        'updated_at'
    ];
    
    public function scores()
    {
        return $this->hasMany(Score::class);
    }
}