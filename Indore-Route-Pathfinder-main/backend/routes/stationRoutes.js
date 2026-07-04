import express from "express";
import Station from "../models/Station.js";

const router = express.Router();

// GET /api/stations - fetch all stations with connected station names
router.get("/", async (req, res) => {
  try {
    const stations = await Station.find().populate("connections.station", "name _id");
    res.json(stations);
  } catch (err) {
    console.error("GET /api/stations error:", err);
    res.status(500).json({ 
      error: "Failed to fetch stations",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// POST /api/stations - create a new station
router.post("/", async (req, res) => {
  const { name, coordinates } = req.body;

  if (!name) {
    return res.status(400).json({ 
      error: "Station name is required",
      example: { name: "Station A", coordinates: { lat: 22.7196, lng: 75.8577 } }
    });
  }

  try {
    const existingStation = await Station.findOne({ name });
    if (existingStation) {
      return res.status(400).json({ 
        error: "Station already exists",
        existingId: existingStation._id
      });
    }

    const station = new Station({ 
      name, 
      coordinates: coordinates || null,
      connections: [] 
    });
    await station.save();

    res.status(201).json(station);
  } catch (err) {
    console.error("POST /api/stations error:", err);
    res.status(500).json({ 
      error: "Failed to create station",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// POST /api/stations/connect - connect two stations
router.post("/connect", async (req, res) => {
  const { firstStation, secondStation, distance, cost } = req.body;

  // Validate inputs
  if (!firstStation || !secondStation) {
    return res.status(400).json({ 
      error: "Both station IDs are required",
      example: {
        firstStation: "station_id_1",
        secondStation: "station_id_2",
        distance: 500, // in meters
        cost: 20 // in rupees
      }
    });
  }

  if (!distance || !cost || distance <= 0 || cost <= 0) {
    return res.status(400).json({ 
      error: "Distance and cost must be positive numbers",
      received: { distance, cost }
    });
  }

  try {
    // Validate stations exist
    const [station1, station2] = await Promise.all([
      Station.findById(firstStation),
      Station.findById(secondStation)
    ]);

    if (!station1 || !station2) {
      const missing = [];
      if (!station1) missing.push(`firstStation: ${firstStation}`);
      if (!station2) missing.push(`secondStation: ${secondStation}`);
      return res.status(404).json({ 
        error: "Station(s) not found",
        missing
      });
    }

    // Check for existing connections
    const connectionExists = station1.connections.some(
      conn => conn.station.toString() === secondStation
    );

    if (connectionExists) {
      return res.status(400).json({ 
        error: "Stations already connected",
        suggestion: "Use PUT /api/stations/connect to update connection details"
      });
    }

    // Create bidirectional connection
    await Promise.all([
      Station.findByIdAndUpdate(firstStation, {
        $push: {
          connections: { station: secondStation, distance, cost }
        }
      }),
      Station.findByIdAndUpdate(secondStation, {
        $push: {
          connections: { station: firstStation, distance, cost }
        }
      })
    ]);

    res.json({ 
      success: true,
      message: "Stations connected successfully",
      connection: { firstStation, secondStation, distance, cost }
    });
  } catch (err) {
    console.error("POST /api/stations/connect error:", err);
    res.status(500).json({ 
      error: "Failed to connect stations",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

export default router;