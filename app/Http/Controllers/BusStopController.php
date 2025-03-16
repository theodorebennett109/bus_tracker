<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BusStop;

class BusStopController extends Controller
{
    // Get all bus stops
    public function index()
    {
        return response()->json(BusStop::all());
    }

    // Store a new bus stop
    public function store(Request $request)
    {
        $request->validate([
            'bus_route_id' => 'required|exists:bus_routes,id',
            'name' => 'required|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $stop = BusStop::create([
            'bus_route_id' => $request->bus_route_id,
            'name' => $request->name,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
        ]);

        return response()->json($stop, 201);
    }

    // Get a single bus stop by ID
    public function show($id)
    {
        $stop = BusStop::find($id);
        if (!$stop) {
            return response()->json(['message' => 'Stop not found'], 404);
        }
        return response()->json($stop);
    }

    // Update a bus stop
    public function update(Request $request, $id)
    {
        $stop = BusStop::find($id);
        if (!$stop) {
            return response()->json(['message' => 'Stop not found'], 404);
        }

        $stop->update($request->all());
        return response()->json($stop);
    }

    // Delete a bus stop
    public function destroy($id)
    {
        $stop = BusStop::find($id);
        if (!$stop) {
            return response()->json(['message' => 'Stop not found'], 404);
        }

        $stop->delete();
        return response()->json(['message' => 'Stop deleted successfully']);
    }
}
