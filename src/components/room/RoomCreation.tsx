import React, { useState } from "react";

const RoomCreation = () => {
  const [roomName, setRoomName] = useState("");
  const [password, setPassword] = useState("");

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to create room
    console.log("Room Created:", { roomName, password });
  };

  return (
    <div className="room-creation">
      <h2>Create a New Room</h2>
      <form onSubmit={handleCreateRoom}>
        <div>
          <label>Room Name:</label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Create Room</button>
      </form>
    </div>
  );
};

export default RoomCreation;
