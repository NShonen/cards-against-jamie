import React, { useState } from "react";

const RoomJoin = () => {
  const [roomName, setRoomName] = useState("");
  const [password, setPassword] = useState("");

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to join room
    const response = await fetch("/api/room/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomName, password }),
    });
    const data = await response.json();
    console.log("Join Room Response:", data);
  };

  return (
    <div className="room-join">
      <h2>Join a Room</h2>
      <form onSubmit={handleJoinRoom}>
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
        <button type="submit">Join Room</button>
      </form>
    </div>
  );
};

export default RoomJoin;
