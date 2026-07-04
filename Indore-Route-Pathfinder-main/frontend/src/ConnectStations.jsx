import React, { useState } from 'react';

export default function ConnectStations({ stations, onConnect }) {
  const [stationId1, setStationId1] = useState('');
  const [stationId2, setStationId2] = useState('');
  const [distance, setDistance] = useState('');
  const [cost, setCost] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!stationId1 || !stationId2 || !distance || !cost) return;
    if (stationId1 === stationId2) {
      alert("Choose two different stations");
      return;
    }
    onConnect(stationId1, stationId2, Number(distance), Number(cost));
    setDistance('');
    setCost('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Connect Stations</h2>
      <select value={stationId1} onChange={(e) => setStationId1(e.target.value)}>
        <option value="">Select first station</option>
        {stations.map((s) => (
          <option key={s._id} value={s._id}>
            {s.name}
          </option>
        ))}
      </select>
      <select value={stationId2} onChange={(e) => setStationId2(e.target.value)}>
        <option value="">Select second station</option>
        {stations.map((s) => (
          <option key={s._id} value={s._id}>
            {s.name}
          </option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Distance"
        value={distance}
        onChange={(e) => setDistance(e.target.value)}
      />
      <input
        type="number"
        placeholder="Cost"
        value={cost}
        onChange={(e) => setCost(e.target.value)}
      />
      <button type="submit">Connect</button>
    </form>
  );
}
