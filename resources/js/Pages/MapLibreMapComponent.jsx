import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

export const MapLibreMapComponent = ({ busLocation, viewState, setViewState }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Initialize the map and marker only once
  useEffect(() => {
    if (!mapRef.current && containerRef.current) {
      mapRef.current = new maplibregl.Map({
        container: containerRef.current,
        style: "https://demotiles.maplibre.org/style.json", // demo style URL
        center: [viewState.center.lng, viewState.center.lat],
        zoom: viewState.zoom,
      });

      mapRef.current.addControl(new maplibregl.NavigationControl());

      markerRef.current = new maplibregl.Marker()
        .setLngLat([busLocation.lng, busLocation.lat])
        .addTo(mapRef.current);

      mapRef.current.on("moveend", () => {
        const center = mapRef.current.getCenter();
        const zoom = mapRef.current.getZoom();
        setViewState({ center: { lat: center.lat, lng: center.lng }, zoom });
      });
    }

    // Cleanup map instance on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
    // Run once on mount
  }, []);

  // Update marker position when busLocation changes
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLngLat([busLocation.lng, busLocation.lat]);
    }
  }, [busLocation]);

  // Update map view if viewState changes
  useEffect(() => {
    if (mapRef.current) {
      const currentCenter = mapRef.current.getCenter();
      if (
        currentCenter.lat !== viewState.center.lat ||
        currentCenter.lng !== viewState.center.lng
      ) {
        mapRef.current.setCenter([viewState.center.lng, viewState.center.lat]);
      }
      if (mapRef.current.getZoom() !== viewState.zoom) {
        mapRef.current.setZoom(viewState.zoom);
      }
    }
  }, [viewState]);

  return <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />;
};

export default MapLibreMapComponent;
