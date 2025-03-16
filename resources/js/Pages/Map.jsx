import { Layout, Menu, Spin } from "antd";
import { GoogleMap, LoadScript, Polyline, Marker } from "@react-google-maps/api";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { CompassOutlined } from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

const containerStyle = { width: "100%", height: "100vh" };
const defaultCenter = { lat: 17.977255, lng: -76.788383 }; // Spanish Town Approximate Center
const mapApiKey = import.meta.env.VITE_MAP_API_KEY;
const safelyParseJSON = (json, fallback) => {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error("JSON parsing error:", error);
    return fallback;
  }
};

const Map = () => {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/bus/routes");
        setRoutes(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching bus routes:", error);
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  const handleRouteSelect = (routeId) => {
    const selected = routes.find((r) => r.id === parseInt(routeId));
    if (selected) {
      const parsedCoordinates = safelyParseJSON(selected.coordinates, []);
      setSelectedRoute({ ...selected, coordinates: parsedCoordinates });
      if (mapRef.current && parsedCoordinates.length > 0) {
        mapRef.current.panTo(parsedCoordinates[0]); // Smooth transition to new route
      }
    }
  };

  return (
    <Layout style={{ height: "100vh" }}>
      {/* Sidebar with Routes */}
      <Sider width={250} theme="dark">
        <div style={{ padding: "16px", color: "white", fontSize: "18px", fontWeight: "bold", textAlign: "center" }}>
          Bus Routes
        </div>
        {loading ? (
          <Spin tip="Loading Routes..." style={{ display: "block", margin: "auto", textAlign: "center", paddingTop: "20px" }} />
        ) : (
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={[]}
            onClick={(e) => handleRouteSelect(e.key)}
          >
            {routes.map((route) => (
              <Menu.Item key={route.id} icon={<CompassOutlined />}>
                {route.name}
              </Menu.Item>
            ))}
          </Menu>
        )}
      </Sider>

      {/* Main Content (Map) */}
      <Layout>
        <Header style={{ backgroundColor: "#001529", color: "white", fontSize: "18px", textAlign: "center" }}>
          Bus Route Tracker
        </Header>
        <Content>
          <LoadScript googleMapsApiKey={mapApiKey}>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={defaultCenter} // Center defaults to defaultCenter
              zoom={selectedRoute ? 13 : 12}
              onLoad={(map) => (mapRef.current = map)}
            >
              {selectedRoute && (
                <>
                  {/* Route Polyline */}
                  <Polyline
                    path={selectedRoute.coordinates}
                    options={{ strokeColor: "blue", strokeWeight: 5 }}
                  />
                  {/* Route Stops */}
                  {selectedRoute.coordinates.map((point, index) => (
                    <Marker
                      key={index}
                      position={{ lat: point.lat, lng: point.lng }}
                      label={(index + 1).toString()}
                    />
                  ))}
                </>
              )}
            </GoogleMap>
          </LoadScript>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Map;