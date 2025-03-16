import React, { useCallback } from "react";
import { GoogleMap, LoadScript, Polyline, Marker } from "@react-google-maps/api";

const containerStyle = { width: "100%", height: "400px" };

export const GoogleMapComponent = ({
  busLocation,
  viewState,
  setViewState,
  selectedRoute,
  mapRef,
  mapApiKey,
}) => {
  const handleLoad = useCallback((map) => {
    mapRef.current = map;
  }, [mapRef]);

  const handleIdle = useCallback(() => {
    if (mapRef.current) {
      const newCenter = mapRef.current.getCenter().toJSON();
      const newZoom = mapRef.current.getZoom();
      setViewState({ center: newCenter, zoom: newZoom });
    }
  }, [mapRef, setViewState]);

  return (
    <LoadScript googleMapsApiKey={mapApiKey}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={viewState.center}
        zoom={viewState.zoom}
        onLoad={handleLoad}
        onIdle={handleIdle}
      >
        {selectedRoute && (
          <>
            <Polyline
              path={selectedRoute.coordinates}
              options={{ strokeColor: "blue", strokeWeight: 5 }}
            />
            {selectedRoute.coordinates.map((point, index) => (
              <Marker
                key={`route-point-${index}`}
                position={{ lat: point.lat, lng: point.lng }}
                label={(index + 1).toString()}
              />
            ))}
          </>
        )}
        {busLocation && <Marker position={busLocation} label="Bus" />}
      </GoogleMap>
    </LoadScript>
  );
};

export default GoogleMapComponent;
