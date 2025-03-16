<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bus_routes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->json('coordinates'); // Array of lat/lng points
            $table->timestamps();
        });

        Schema::create('bus_stops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bus_route_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->timestamps();
        });
        
        
    }
};
