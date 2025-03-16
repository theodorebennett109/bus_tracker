<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BusRouteController;
use App\Http\Controllers\BusStopController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| These routes are automatically loaded by Laravel.
|
*/

// Test API Route
Route::get('/test', fn() => response()->json(['message' => 'API is working!']));

// Public Bus Routes (No Authentication Required)
Route::middleware('guest')->group(function () {
    Route::get('/bus/routes', [BusRouteController::class, 'index']);
    Route::get('/bus/routes/{id}', [BusRouteController::class, 'show']);
});

// Protected Bus Routes (Requires Authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('bus')->group(function () {
        Route::post('/routes', [BusRouteController::class, 'store']);
        Route::put('/routes/{id}', [BusRouteController::class, 'update']);
        Route::delete('/routes/{id}', [BusRouteController::class, 'destroy']);
    });
});
