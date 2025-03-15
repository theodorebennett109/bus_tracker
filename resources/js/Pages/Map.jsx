import React, { useEffect } from "react";

const Map = () => {
  useEffect(() => {
    const initMap = () => {
      if (window.google) {
        const map = new window.google.maps.Map(document.getElementById("map"), {
          center: { lat: 18.1096, lng: -77.2975 }, // Default center (Jamaica)
          zoom: 8,
        });

        // Get user's current location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };

              // Move map to user's location
              map.setCenter(userLocation);
              map.setZoom(15);

              // Add marker for user's location
              new window.google.maps.Marker({
                position: userLocation,
                map,
                title: "You are here",
                icon: {
                  url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                },
              });
            },
            () => {
              console.warn("Geolocation permission denied. Showing default Jamaica location.");
            }
          );
        } else {
          console.warn("Geolocation is not supported by this browser.");
        }

        const parishes = [
          {
            name: "Kingston",
            coordinates: [
              { lat: 17.9784, lng: -76.7872 },
              { lat: 17.9726, lng: -76.7714 },
              { lat: 17.9600, lng: -76.7728 },
              { lat: 17.9616, lng: -76.7889 },
            ],
            color: "#FF5733",
          },
          {
            name: "St. Andrew",
            coordinates: [
              { lat: 18.0281, lng: -76.7997 },
              { lat: 18.0203, lng: -76.7573 },
              { lat: 17.9882, lng: -76.7601 },
              { lat: 17.9784, lng: -76.7872 },
            ],
            color: "#33FF57",
          },
          {
            name: "St. Catherine",
            coordinates: [
              { lat: 18.0433, lng: -77.0872 },
              { lat: 18.0112, lng: -76.9928 },
              { lat: 17.9589, lng: -76.9800 },
              { lat: 17.9650, lng: -77.0889 },
            ],
            color: "#3357FF",
          },
        ];

        // Loop through parishes and draw polygons
        parishes.forEach((parish) => {
          const polygon = new window.google.maps.Polygon({
            paths: parish.coordinates,
            strokeColor: parish.color,
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: parish.color,
            fillOpacity: 0.35,
          });

          polygon.setMap(map);

          // Add click event to show parish name
          polygon.addListener("click", () => {
            alert(`You clicked on ${parish.name}`);
          });
        });
      }
    };

    const apiKey = import.meta.env.VITE_MAP_API_KEY || process.env.REACT_APP_MAP_API_KEY;

    if (!apiKey) {
      console.error("Google Maps API key is missing!");
      return;
    }

    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.body.appendChild(script);
    } else {
      initMap();
    }
  }, []);

  return (
    <div style={styles.container}>
      <div id="map" style={styles.map} />
      <div style={styles.textContainer}>
        <h2 style={styles.heading}>Jamaica's Parishes</h2>
        <p style={styles.paragraph}>
          Click on any parish to see its name. Your current location will be shown as a **blue dot** if you allow location access.
        </p>
      </div>
    </div>
  );
};

// CSS-in-JS styles
const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "500px",
  },
  map: {
    height: "100%",
    width: "50%",
    borderRadius: "10px",
  },
  textContainer: {
    width: "50%",
    padding: "20px",
    textAlign: "left",
  },
  heading: {
    fontSize: "24px",
    marginBottom: "10px",
  },
  paragraph: {
    fontSize: "16px",
    lineHeight: "1.5",
  },
};

export default Map;
