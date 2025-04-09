import { NextResponse } from "next/server";
import { roomStore } from "../store";

export async function POST(request: Request) {
  try {
    const { roomCode, password } = await request.json();
    console.log("Attempting to join room:", roomCode);

    if (!roomCode) {
      console.log("Room code missing");
      return NextResponse.json(
        { error: "Room code is required" },
        { status: 400 }
      );
    }

    const room = roomStore.getRoom(roomCode);
    console.log("Found room:", room ? "yes" : "no");

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Check password if room has one
    if (room.password && room.password !== password) {
      console.log("Password mismatch");
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 403 }
      );
    }

    // Return success without exposing password
    console.log("Join successful for room:", roomCode);
    return NextResponse.json({
      success: true,
      roomCode,
      roomName: room.roomName,
      createdAt: room.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error joining room:", error);
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 });
  }
}
