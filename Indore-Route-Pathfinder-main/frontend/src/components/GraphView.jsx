import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactFlow, { MiniMap, Controls } from 'react-flow-renderer';

const GraphView = () => {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/stations')  // Assuming your backend is at port 5000
      .then(res => {
        const stations = res.data;

        const nodes = stations.map((station, index) => ({
          id: station._id,
          data: { label: station.name },
          position: { x: 100 + index * 150, y: 100 }
        }));

        const edges = [];
        stations.forEach(station => {
          station.connections.forEach(conn => {
            edges.push({
              id: `${station._id}-${conn.to}`,
              source: station._id,
              target: conn.to,
              label: `${conn.distance} km / ₹${conn.cost}`,
              animated: true,
            });
          });
        });

        setElements([...nodes, ...edges]);
      });
  }, []);

  return (
    <div style={{ height: 500 }}>
      <ReactFlow elements={elements}>
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default GraphView;
