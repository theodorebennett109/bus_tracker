import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Layout,
  Menu,
  Spin,
  Input,
  Button,
  List,
  message as antdMessage,
  Drawer,
  Tabs,
} from "antd";
import {
  CompassOutlined,
  StarOutlined,
  ExclamationCircleOutlined,
  SendOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { GoogleMapComponent } from "./GoogleMapComponent";
import { MapLibreMapComponent } from "./MapLibreMapComponent";
import "maplibre-gl/dist/maplibre-gl.css";

const { Header, Sider, Content } = Layout;
const { TextArea } = Input;

const defaultCenter = { lat: 17.977255, lng: -76.788383 };
const busDefaultLocation = { lat: 18.0195, lng: -76.8194 };

const mapApiKey = import.meta.env.VITE_MAP_API_KEY;

// Helper function to safely parse JSON
const safelyParseJSON = (json, fallback) => {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error("JSON parsing error:", error);
    return fallback;
  }
};

const Map = () => {
  // State declarations
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busLocation, setBusLocation] = useState(busDefaultLocation);
  const mapRef = useRef(null);

  // Shared view state between maps
  const [viewState, setViewState] = useState({ center: defaultCenter, zoom: 12 });

  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [chatVisible, setChatVisible] = useState(false);

  // Sider active tab state ("1": Routes, "2": Favorites, "3": Threat Level)
  const [activeSiderTab, setActiveSiderTab] = useState("1");

  // Fetch bus routes on mount
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/bus/routes");
        setRoutes(res.data);
      } catch (error) {
        console.error("Error fetching bus routes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoutes();
  }, []);

  // Poll bus location every second
  useEffect(() => {
    const fetchBusLocation = async () => {
      try {
        const res = await axios.get(
          "https://vq1kjn83jl.execute-api.us-east-1.amazonaws.com/prod/getLocationById/1"
        );
        const { latitude, longitude } = res.data;
        setBusLocation({ lat: latitude, lng: longitude });
      } catch (error) {
        console.error("Error fetching bus location:", error);
      }
    };

    fetchBusLocation();
    const interval = setInterval(fetchBusLocation, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle route selection and update view state accordingly
  const handleRouteSelect = (routeId) => {
    const selected = routes.find((r) => r.id === parseInt(routeId, 10));
    if (selected) {
      const parsedCoordinates = safelyParseJSON(selected.coordinates, []);
      const formattedCoordinates = parsedCoordinates.map((point) => ({
        lat: point.latitude,
        lng: point.longitude,
        location: point.location,
        time: point.time,
      }));
      setSelectedRoute({ ...selected, coordinates: formattedCoordinates });
      if (formattedCoordinates.length > 0) {
        const newCenter = formattedCoordinates[0];
        if (mapRef.current) {
          mapRef.current.panTo(newCenter);
        }
        setViewState({ center: newCenter, zoom: 13 });
      }
    }
  };

  // Handle sending user message via backend endpoints
  const handleSendMessage = useCallback(async () => {
    if (!userInput.trim()) return;
    const newMessage = { sender: "user", text: userInput };
    setChatMessages((prev) => [...prev, newMessage]);
    const currentMessage = userInput;
    setUserInput("");
    setChatLoading(true);
    try {
      let currentThreadId = threadId;
      if (!currentThreadId) {
        const newThreadRes = await axios.post("https://api/new");
        currentThreadId = newThreadRes.data.thread_id;
        setThreadId(currentThreadId);
      }
      await axios.post(`https://api/threads/${currentThreadId}`, {
        content: currentMessage,
      });
      const threadRes = await axios.get(`https://api/threads/${currentThreadId}`);
      const assistantMsg = threadRes.data.messages
        .reverse()
        .find((msg) => msg.role === "assistant");
      if (assistantMsg) {
        setChatMessages((prev) => [
          ...prev,
          { sender: "assistant", text: assistantMsg.content },
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { sender: "assistant", text: "No reply" },
        ]);
      }
    } catch (error) {
      console.error("Error calling assistant endpoint:", error);
      antdMessage.error("Failed to get a response from the assistant.");
    } finally {
      setChatLoading(false);
    }
  }, [userInput, threadId]);

  // Define Tab items for the Sider
  const tabItems = [
    {
      key: "1",
      label: <CompassOutlined style={{ fontSize: "20px" }} />,
      children: loading ? (
        <Spin
          style={{
            display: "block",
            margin: "auto",
            textAlign: "center",
            paddingTop: "20px",
          }}
        />
      ) : (
        <Menu theme="dark" mode="inline" onClick={(e) => handleRouteSelect(e.key)}>
          {routes.map((route) => (
            <Menu.Item key={route.id} icon={<CompassOutlined />}>
              {route.name}
            </Menu.Item>
          ))}
        </Menu>
      ),
    },
    {
      key: "2",
      label: <StarOutlined style={{ fontSize: "20px" }} />,
      children: (
        <div style={{ padding: "16px", color: "white" }}>
          Favorites content goes here
        </div>
      ),
    },
    {
      key: "3",
      label: <ExclamationCircleOutlined style={{ fontSize: "20px" }} />,
      children: (
        <div style={{ padding: "16px", color: "white" }}>Threat Level details</div>
      ),
    },
  ];

  return (
    <Layout style={{ height: "100vh" }}>
      {/* Sider with Tabs */}
      <Sider width={250} theme="dark">
        <style>
          {`
            .ant-tabs-tab {
              color: white !important;
            }
            .ant-tabs-tab-active {
              color: #1890ff !important;
            }
          `}
        </style>
        <Tabs
          activeKey={activeSiderTab}
          onChange={(key) => setActiveSiderTab(key)}
          items={tabItems}
          tabPosition="top"
          style={{ height: "100%" }}
        />
      </Sider>

      {/* Main content */}
      <Layout>
        <Header
          style={{
            backgroundColor: "#001529",
            color: "white",
            fontSize: "18px",
            textAlign: "center",
          }}
        >
          Bus Route Tracker & OpenAI Assistant
        </Header>
        <Content style={{ position: "relative" }}>
          {activeSiderTab === "3" ? (
            <MapLibreMapComponent
              busLocation={busLocation}
              viewState={viewState}
              setViewState={setViewState}
            />
          ) : (
            <GoogleMapComponent
              busLocation={busLocation}
              viewState={viewState}
              setViewState={setViewState}
              selectedRoute={selectedRoute}
              mapRef={mapRef}
              // Pass the map API key as a prop (or ensure it's defined inside the component)
              mapApiKey={mapApiKey}
            />
          )}

          {/* Floating Action Button for Chat */}
          <Button
            type="primary"
            shape="circle"
            icon={<MessageOutlined />}
            size="large"
            style={{
              position: "absolute",
              right: 24,
              bottom: 24,
              zIndex: 1000,
            }}
            onClick={() => setChatVisible(true)}
          />

          {/* Drawer for Chat */}
          <Drawer
            title="Assistant Chat"
            placement="right"
            closable={true}
            onClose={() => setChatVisible(false)}
            open={chatVisible}
            width={350}
          >
            <div style={{ height: "calc(100vh - 200px)", overflowY: "auto" }}>
              <List
                dataSource={chatMessages}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      justifyContent: item.sender === "user" ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        background: item.sender === "user" ? "#daf8cb" : "#f0f0f0",
                        padding: "8px 16px",
                        borderRadius: "16px",
                        maxWidth: "80%",
                      }}
                    >
                      {item.text}
                    </div>
                  </List.Item>
                )}
              />
            </div>
            <TextArea
              rows={2}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your message..."
              style={{ marginTop: "16px" }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              loading={chatLoading}
              style={{ marginTop: "8px", width: "100%" }}
            >
              Send
            </Button>
          </Drawer>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Map;
