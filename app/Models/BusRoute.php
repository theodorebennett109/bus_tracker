<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BusRoute extends Model
{
    public function stops() {
        return $this->hasMany(BusStop::class);
    }
}
