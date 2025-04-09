import { NextResponse } from "next/server";
import { roomStore } from "../store";

export async function GET(req: Request) {
  const roomCode = req.url.split("/").pop();
  const room = roomStore.getRoom(roomCode || "");

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
}
