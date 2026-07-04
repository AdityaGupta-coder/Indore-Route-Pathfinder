import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  getStations,
  createStation,
  connectStations,
  getShortestPath,
} from "./api";
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ── Toast Notification System ──
function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast ${toast.type} ${toast.exiting ? "toast-exit" : ""}`}
          onAnimationEnd={() => {
            if (toast.exiting) onDismiss(toast.id);
          }}
        >
          <span className="toast-icon">
            {toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : "ℹ"}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

// ── Map: Auto-fit bounds to path ──
function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions && positions.length > 1) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else if (positions && positions.length === 1) {
      map.setView(positions[0], 14);
    }
  }, [positions, map]);
  return null;
}

// ── Known Indore landmarks → approximate coordinates ──
const INDORE_COORDS = {
  "rajwada": [22.7189, 75.8571],
  "vijay nagar": [22.7533, 75.8793],
  "palasia": [22.7242, 75.8726],
  "sarwate bus stand": [22.7155, 75.8629],
  "geeta bhawan": [22.7195, 75.8687],
  "bhanwarkuan": [22.7449, 75.8402],
  "lmd square": [22.7247, 75.8576],
  "sapna sangeeta": [22.7310, 75.8770],
  "mhow": [22.5547, 75.7628],
  "rau": [22.6582, 75.8225],
  "dewas naka": [22.7540, 75.8467],
  "rajiv gandhi square": [22.7157, 75.8648],
  "sarvate": [22.7155, 75.8629],
  "MR 10": [22.7650, 75.8950],
  "mr 10": [22.7650, 75.8950],
  "bhawarkua": [22.7449, 75.8402],
  "treasure island": [22.7260, 75.8560],
  "c21 mall": [22.7192, 75.8564],
  "malwa mill": [22.7119, 75.8550],
  "industry house": [22.7165, 75.8698],
  "annapurna": [22.7268, 75.8524],
  "sudama nagar": [22.7096, 75.8705],
  "scheme 78": [22.7455, 75.8918],
  "ab road": [22.7250, 75.8580],
  "silicon city": [22.6880, 75.8420],
  "aerodrome": [22.7230, 75.8002],
  "bypass": [22.7600, 75.8200],
  "ring road": [22.7500, 75.8100],
  "super corridor": [22.6700, 75.8250],
};

function getCoordinatesForStation(name, index, total) {
  // Check if we have a known coordinate for this station name
  const key = name.toLowerCase().trim();
  for (const [landmark, coords] of Object.entries(INDORE_COORDS)) {
    if (key.includes(landmark) || landmark.includes(key)) {
      return coords;
    }
  }
  // Fallback: distribute along a curved path within Indore
  const center = [22.7196, 75.8577];
  const spread = 0.035;
  const t = total > 1 ? index / (total - 1) : 0.5;
  // Create an arc from SW to NE with some curve
  const angle = t * Math.PI * 0.8 - Math.PI * 0.4;
  const lat = center[0] + spread * Math.sin(angle) + (t - 0.5) * spread * 0.5;
  const lng = center[1] + spread * Math.cos(angle) * 1.2 + (t - 0.5) * spread;
  return [lat, lng];
}

// ── Route Map Component ──
function RouteMap({ pathNames }) {
  const positions = useMemo(() => {
    if (!pathNames || pathNames.length === 0) return [];
    return pathNames.map((name, i) =>
      getCoordinatesForStation(name, i, pathNames.length)
    );
  }, [pathNames]);

  if (positions.length === 0) return null;

  return (
    <div className="route-map-wrapper">
      <div className="route-map-header">
        <span>🗺️</span> Route on Map
      </div>
      <div className="route-map-container">
        <MapContainer
          center={[22.7196, 75.8577]}
          zoom={13}
          className="route-map"
          scrollWheelZoom={true}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <FitBounds positions={positions} />

          {/* Route polyline with glow effect */}
          <Polyline
            positions={positions}
            pathOptions={{
              color: "#0ea5e9",
              weight: 5,
              opacity: 0.3,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
          <Polyline
            positions={positions}
            pathOptions={{
              color: "#38bdf8",
              weight: 3,
              opacity: 0.9,
              dashArray: "12, 8",
              lineCap: "round",
              lineJoin: "round",
            }}
          />

          {/* Station markers */}
          {positions.map((pos, idx) => {
            const isStart = idx === 0;
            const isEnd = idx === positions.length - 1;
            const color = isStart
              ? "#34d399"
              : isEnd
              ? "#f87171"
              : "#38bdf8";
            const radius = isStart || isEnd ? 10 : 7;

            return (
              <CircleMarker
                key={idx}
                center={pos}
                radius={radius}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.9,
                  color: "#fff",
                  weight: 2,
                  opacity: 0.8,
                }}
              >
                <Tooltip
                  permanent={isStart || isEnd}
                  direction={isStart ? "left" : isEnd ? "right" : "top"}
                  className="map-tooltip"
                >
                  <span className="map-tooltip-label">
                    {isStart ? "🟢 " : isEnd ? "🔴 " : ""}
                    {pathNames[idx]}
                  </span>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
      <div className="map-legend">
        <span className="legend-item"><span className="legend-dot start"></span> Start</span>
        <span className="legend-item"><span className="legend-dot mid"></span> Intermediate</span>
        <span className="legend-item"><span className="legend-dot end"></span> Destination</span>
      </div>
    </div>
  );
}

export default function App() {
  // ── Existing State (UNCHANGED) ──
  const [locations, setLocations] = useState([]);
  const [newLocationName, setNewLocationName] = useState("");
  const [firstLocation, setFirstLocation] = useState("");
  const [secondLocation, setSecondLocation] = useState("");
  const [distance, setDistance] = useState("");
  const [cost, setCost] = useState("");
  const [loading, setLoading] = useState(false);
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [shortestPath, setShortestPath] = useState(null);
  const [pathLoading, setPathLoading] = useState(false);

  // ── Toast State ──
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      );
    }, 3000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Data Fetching (UNCHANGED LOGIC) ──
  useEffect(() => {
    fetchLocations();
  }, []);

  async function fetchLocations() {
    const data = await getStations();
    setLocations(data);
  }

  // ── Handlers (SAME LOGIC, alert → toast) ──
  async function handleCreateLocation(e) {
    e.preventDefault();
    if (!newLocationName) return addToast("Please enter a location name", "error");
    setLoading(true);
    await createStation(newLocationName);
    setNewLocationName("");
    await fetchLocations();
    setLoading(false);
    addToast(`Station "${newLocationName}" added successfully!`, "success");
  }

  async function handleConnectLocations(e) {
    e.preventDefault();
    if (!firstLocation || !secondLocation || !distance || !cost) {
      return addToast("Please fill all fields to connect locations", "error");
    }
    setLoading(true);
    await connectStations({
      firstStation: firstLocation,
      secondStation: secondLocation,
      distance: Number(distance),
      cost: Number(cost),
    });
    setFirstLocation("");
    setSecondLocation("");
    setDistance("");
    setCost("");
    await fetchLocations();
    setLoading(false);
    addToast("Stations connected successfully!", "success");
  }

  async function handleFindShortestPath(e) {
    e.preventDefault();
    if (!fromLocation || !toLocation)
      return addToast("Please select both locations", "error");

    setPathLoading(true);
    setShortestPath(null);

    try {
      const res = await getShortestPath(fromLocation, toLocation);

      if (!res.success) {
        throw new Error(res.error || "No path found");
      }

      const readablePath = res.pathDetails.map((loc) => loc.name);

      setShortestPath({
        ...res,
        readablePath,
        locationDetails: res.pathDetails,
      });
      addToast("Route found!", "success");
    } catch (error) {
      console.error("Path finding error:", error);
      addToast(error.message || "Failed to find path", "error");
    } finally {
      setPathLoading(false);
    }
  }

  return (
    <div className="app-wrapper">
      <div className="app-container">
        {/* ── Toast Notifications ── */}
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />

        {/* ── Hero Header ── */}
        <header className="hero-header">
          <span className="hero-icon">🚇</span>
          <h1 className="hero-title">Indore Route Pathfinder</h1>
          <p className="hero-subtitle">
            Find the optimal route between stations using Dijkstra's Algorithm
          </p>
        </header>

        {/* ── 🧭 Find Best Route ── */}
        <section className="glass-card" id="find-route">
          <div className="section-header">
            <div className="section-icon route">🧭</div>
            <div>
              <div className="section-title">Find Best Route</div>
              <div className="section-desc">
                Calculate the shortest path between two stations
              </div>
            </div>
          </div>

          <form onSubmit={handleFindShortestPath}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="from-location">From</label>
                <select
                  id="from-location"
                  className="form-select"
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                >
                  <option value="">Select origin</option>
                  {locations.map((loc) => (
                    <option key={loc._id} value={loc._id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="to-location">To</label>
                <select
                  id="to-location"
                  className="form-select"
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                >
                  <option value="">Select destination</option>
                  {locations.map((loc) => (
                    <option key={loc._id} value={loc._id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ flex: "0 0 auto", alignSelf: "flex-end" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={pathLoading}
                >
                  {pathLoading ? (
                    <>
                      <span className="spinner"></span> Finding...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">⚡</span> Find Route
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Route Result */}
          {shortestPath && (
            <div className="route-result">
              <div className="route-result-header">
                <span>✅</span> Optimal Route Found
              </div>

              <div className="route-stats">
                <div className="route-stat">
                  <div className="route-stat-label">Total Distance</div>
                  <div className="route-stat-value distance">
                    {shortestPath.totalDistance}
                    <span style={{ fontSize: "0.7em", opacity: 0.7 }}> km</span>
                  </div>
                </div>
                <div className="route-stat">
                  <div className="route-stat-label">Total Cost</div>
                  <div className="route-stat-value cost">
                    ₹{shortestPath.totalCost}
                  </div>
                </div>
                <div className="route-stat">
                  <div className="route-stat-label">Stops</div>
                  <div className="route-stat-value steps">
                    {shortestPath.steps || shortestPath.readablePath.length - 1}
                  </div>
                </div>
              </div>

              <div className="route-path">
                {shortestPath.readablePath.map((name, idx) => {
                  const isStart = idx === 0;
                  const isEnd = idx === shortestPath.readablePath.length - 1;
                  return (
                    <React.Fragment key={idx}>
                      {idx > 0 && <span className="route-arrow">→</span>}
                      <span
                        className={`route-node ${isStart ? "start" : ""} ${isEnd ? "end" : ""}`}
                      >
                        <span className="route-node-dot"></span>
                        {name}
                      </span>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* ── Interactive Map ── */}
              <RouteMap pathNames={shortestPath.readablePath} />
            </div>
          )}
        </section>

        {/* ── 📍 Add Station ── */}
        <section className="glass-card" id="add-station">
          <div className="section-header">
            <div className="section-icon add">📍</div>
            <div>
              <div className="section-title">Add Station</div>
              <div className="section-desc">
                Register a new station in the network
              </div>
            </div>
          </div>

          <form onSubmit={handleCreateLocation}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="station-name">Station Name</label>
                <input
                  id="station-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rajwada, Vijay Nagar..."
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="form-group" style={{ flex: "0 0 auto", alignSelf: "flex-end" }}>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span> Adding...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">+</span> Add Station
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* ── 🔗 Connect Stations ── */}
        <section className="glass-card" id="connect-stations">
          <div className="section-header">
            <div className="section-icon connect">🔗</div>
            <div>
              <div className="section-title">Connect Stations</div>
              <div className="section-desc">
                Create a bidirectional link between two stations
              </div>
            </div>
          </div>

          <form onSubmit={handleConnectLocations}>
            <div className="connect-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="first-station">First Station</label>
                <select
                  id="first-station"
                  className="form-select"
                  value={firstLocation}
                  onChange={(e) => setFirstLocation(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Select station</option>
                  {locations.map((loc) => (
                    <option key={loc._id} value={loc._id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="second-station">Second Station</label>
                <select
                  id="second-station"
                  className="form-select"
                  value={secondLocation}
                  onChange={(e) => setSecondLocation(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Select station</option>
                  {locations.map((loc) => (
                    <option key={loc._id} value={loc._id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="connect-numbers" style={{ marginTop: "var(--space-md)" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="conn-distance">Distance (km)</label>
                <input
                  id="conn-distance"
                  type="number"
                  className="form-input"
                  placeholder="e.g. 5"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="conn-cost">Cost (₹)</label>
                <input
                  id="conn-cost"
                  type="number"
                  className="form-input"
                  placeholder="e.g. 20"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div style={{ marginTop: "var(--space-md)" }}>
              <button
                type="submit"
                className="btn btn-purple"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span> Connecting...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">🔗</span> Connect Stations
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* ── 📋 Station List ── */}
        <section className="glass-card" id="station-list">
          <div className="section-header">
            <div className="section-icon list">📋</div>
            <div>
              <div className="section-title">Network Stations</div>
              <div className="section-desc">
                All registered stations and their connections
              </div>
            </div>
            {locations.length > 0 && (
              <span className="station-count">
                {locations.length} station{locations.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {locations.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">🏙️</span>
              <p className="empty-state-text">
                No stations added yet. Add your first station above to get started!
              </p>
            </div>
          ) : (
            <div className="station-grid">
              {locations.map((location) => (
                <div className="station-card" key={location._id}>
                  <div className="station-name">
                    <span className="station-marker"></span>
                    {location.name}
                  </div>
                  {location.connections?.length > 0 ? (
                    <ul className="connection-list">
                      {location.connections.map((conn, idx) => (
                        <li key={idx} className="connection-badge">
                          <span className="conn-name">
                            {conn.station?.name || "Unknown"}
                          </span>
                          <span className="conn-sep">•</span>
                          {conn.distance} km
                          <span className="conn-sep">•</span>
                          ₹{conn.cost}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="no-connections">No connections yet</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
