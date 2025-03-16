<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BusRoute;

class BusRouteController extends Controller
{
    // Get all bus routes
    public function index()
    {
        return response()->json(BusRoute::all());
    }

    // Store a new bus route
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'coordinates' => 'required|json',
        ]);

        $route = BusRoute::create([
            'name' => $request->name,
            'coordinates' => $request->coordinates,
        ]);

        return response()->json($route, 201);
    }

    // Get a single bus route by ID
    public function show($id)
    {
        $route = BusRoute::find($id);
        if (!$route) {
            return response()->json(['message' => 'Route not found'], 404);
        }
        return response()->json($route);
    }

    // Update a bus route
    public function update(Request $request, $id)
    {
        $route = BusRoute::find($id);
        if (!$route) {
            return response()->json(['message' => 'Route not found'], 404);
        }

        $route->update($request->all());
        return response()->json($route);
    }

    // Delete a bus route
    public function destroy($id)
    {
        $route = BusRoute::find($id);
        if (!$route) {
            return response()->json(['message' => 'Route not found'], 404);
        }

        $route->delete();
        return response()->json(['message' => 'Route deleted successfully']);
    }
}
