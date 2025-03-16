<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BusStop extends Model
{
    public function route() {
        return $this->belongsTo(BusRoute::class);
    }
}
