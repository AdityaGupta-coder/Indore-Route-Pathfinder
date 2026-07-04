import React, { useState } from 'react';

export default function CreateStation({ onCreate }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name);
    setName('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Station</h2>
      <input
        type="text"
        placeholder="Station name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit">Add</button>
    </form>
  );
}
