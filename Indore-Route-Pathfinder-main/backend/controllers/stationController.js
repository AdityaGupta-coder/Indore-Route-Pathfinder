import Station from '../models/Station.js';

// Get all stations
export const getStations = async (req, res) => {
  try {
    const stations = await Station.find().populate('connections.station');
    res.json(stations);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get stations', error });
  }
};

// Create a new station
export const createStation = async (req, res) => {
  try {
    const { name } = req.body;
    const newStation = new Station({ name, connections: [] });
    await newStation.save();
    res.status(201).json(newStation);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create station', error });
  }
};

// Connect two stations with distance and cost
export const connectStations = async (req, res) => {
  try {
    const { stationId1, stationId2, distance, cost } = req.body;

    // Find both stations
    const station1 = await Station.findById(stationId1);
    const station2 = await Station.findById(stationId2);

    if (!station1 || !station2) {
      return res.status(404).json({ message: 'One or both stations not found' });
    }

    // Add connection from station1 to station2
    station1.connections.push({
      station: station2._id,
      distance,
      cost,
    });

    // Add connection from station2 to station1 (undirected graph)
    station2.connections.push({
      station: station1._id,
      distance,
      cost,
    });

    await station1.save();
    await station2.save();

    res.status(200).json({ message: 'Stations connected successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to connect stations', error });
  }
};
