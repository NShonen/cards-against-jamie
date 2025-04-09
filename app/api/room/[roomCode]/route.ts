import { NextResponse } from "next/server";
import { roomStore } from "../store";

// In-memory storage for rooms (replace with your database in production)
export const rooms = new Map<
  string,
  {
    roomName: string;
    password?: string;
    createdAt: Date;
  }
>();

export async function GET(
  request: Request,
  { params }: { params: { roomCode: string } }
) {
  try {
    const roomCode = params.roomCode;
    const room = roomStore.getRoom(roomCode);

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Return all necessary room data except password
    return NextResponse.json({
      roomName: room.roomName,
      createdAt: room.createdAt.toISOString(),
      players: room.players || [],
      status: room.status || "waiting",
      currentRound: room.currentRound || 0,
      blackCard: room.blackCard || null,
      submittedCards: room.submittedCards || [],
      scores: room.scores || [],
    });
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json(
      { error: "Failed to fetch room" },
      { status: 500 }
    );
  }
}
