<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model as EloquentModel;

class BaseModel extends EloquentModel
{
    public $timestamps = true;
    
    protected $dateFormat = 'Y-m-d H:i:s';
}