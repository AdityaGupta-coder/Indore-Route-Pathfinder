import express from 'express';
import Station from '../models/Station.js';
import mongoose from 'mongoose';

const router = express.Router();

/**
 * @api {get} /api/shortest-path Find shortest path between stations
 * @apiName GetShortestPath
 * @apiGroup Path
 *
 * @apiParam {String} from Starting station ID
 * @apiParam {String} to Destination station ID
 *
 * @apiSuccess {Boolean} success True if path found
 * @apiSuccess {Array} path Array of station IDs in path
 * @apiSuccess {Array} pathDetails Array of station details in path
 * @apiSuccess {Number} totalDistance Total distance in meters
 * @apiSuccess {Number} totalCost Total cost in rupees
 * @apiSuccess {Number} steps Number of steps in path
 */
router.get('/', async (req, res) => {
  const { from, to } = req.query;
  console.log(`[ShortestPath] Request from ${from} to ${to}`);

  // Validate inputs
  if (!from || !to) {
    console.log('[ShortestPath] Missing parameters');
    return res.status(400).json({
      success: false,
      error: 'Both from and to station IDs are required',
      example: '/api/shortest-path?from=station1&to=station2'
    });
  }

  try {
    // Get all stations with populated connections
    console.log('[ShortestPath] Fetching stations from DB');
    const stations = await Station.find({})
      .populate('connections.station', '_id name coordinates');
    
    if (!stations.length) {
      console.log('[ShortestPath] No stations found in database');
      return res.status(404).json({
        success: false,
        error: 'No stations found in database'
      });
    }

    // Build graph and station map
    console.log('[ShortestPath] Building graph structure');
    const graph = {};
    const stationMap = {};
    
    stations.forEach(station => {
      const stationId = station._id.toString();
      stationMap[stationId] = station;
      stationMap[station._id] = station; // Store both string and ObjectId versions
      
      graph[stationId] = station.connections.map(conn => ({
        stationId: conn.station._id.toString(), // Ensure string ID
        distance: conn.distance,
        cost: conn.cost
      }));
    });

    // Validate station IDs
    if (!stationMap[from] || !stationMap[to]) {
      console.log('[ShortestPath] Invalid station IDs', {
        fromExists: !!stationMap[from],
        toExists: !!stationMap[to]
      });
      
      return res.status(404).json({
        success: false,
        error: 'One or both station IDs not found',
        availableStations: stations.slice(0, 10).map(s => ({
          id: s._id,
          name: s.name
        }))
      });
    }

    // Dijkstra's algorithm implementation
    console.log('[ShortestPath] Calculating shortest path');
    const distances = {};
    const costs = {};
    const previous = {};
    const visited = new Set();
    const unvisited = new Set(Object.keys(graph));

    // Initialize
    Object.keys(graph).forEach(id => {
      distances[id] = Infinity;
      costs[id] = Infinity;
      previous[id] = null;
    });
    
    distances[from] = 0;
    costs[from] = 0;

    while (unvisited.size > 0) {
      // Find node with smallest distance
      let current = null;
      let smallestDistance = Infinity;
      
      for (const node of unvisited) {
        if (distances[node] < smallestDistance) {
          smallestDistance = distances[node];
          current = node;
        }
      }

      // Exit conditions
      if (current === to || current === null) break;
      unvisited.delete(current);
      visited.add(current);

      // Update neighbors
      for (const neighbor of graph[current]) {
        if (visited.has(neighbor.stationId)) continue;
        
        const altDistance = distances[current] + neighbor.distance;
        const altCost = costs[current] + neighbor.cost;
        
        if (altDistance < distances[neighbor.stationId]) {
          distances[neighbor.stationId] = altDistance;
          costs[neighbor.stationId] = altCost;
          previous[neighbor.stationId] = current;
        }
      }
    }

    // Reconstruct path
    const pathIds = [];
    let current = to.toString(); // Ensure string ID
    
    while (current !== null) {
      pathIds.unshift(current);
      current = previous[current];
    }

    // Check if path exists
    if (distances[to] === Infinity) {
      console.log('[ShortestPath] No path exists between stations');
      return res.status(404).json({
        success: false,
        error: 'No path exists between these stations',
        possibleReasons: [
          'Stations are in disconnected networks',
          'All connections are one-way in the wrong direction'
        ]
      });
    }

    // Build detailed path response
    const pathDetails = pathIds.map(id => {
      const station = stationMap[id];
      return {
        id: station._id,
        name: station.name,
        coordinates: station.coordinates
      };
    });

    console.log('[ShortestPath] Path found:', {
      steps: pathIds.length - 1,
      distance: distances[to],
      cost: costs[to]
    });

    res.json({
      success: true,
      path: pathIds,
      pathDetails,
      totalDistance: distances[to],
      totalCost: costs[to],
      steps: pathIds.length - 1
    });

  } catch (error) {
    console.error('[ShortestPath] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;