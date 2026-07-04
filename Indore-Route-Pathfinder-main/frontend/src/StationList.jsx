import React from 'react';

export default function StationList({ stations }) {
  return (
    <div>
      <h2>Stations</h2>
      <ul>
        {stations.map((station) => (
          <li key={station._id}>
            <strong>{station.name}</strong>
            <br />
            Connections:
            <ul>
              {station.connections.length > 0 ? (
                station.connections.map((conn, i) => (
                  <li key={i}>
                    To: {conn.to} | Distance: {conn.distance} | Cost: {conn.cost}
                  </li>
                ))
              ) : (
                <li>No connections</li>
              )}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
