import { NextResponse } from "next/server";
import { z } from "zod";
import { roomStore } from "../../store";
import { GameStatus } from "@/types/game";

// Validate the request body for starting a game
const startGameSchema = z.object({
  hostId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const roomCode = request.url.split("/").pop();
    if (!roomCode) {
      return NextResponse.json(
        { error: "Room code is required" },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedBody = startGameSchema.safeParse(body);
    if (!validatedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validatedBody.error },
        { status: 400 }
      );
    }

    const { hostId } = validatedBody.data;

    // Get room data
    const room = roomStore.getRoom(roomCode);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Verify host permissions
    const host = room.players.find((p) => p.id === hostId);
    if (!host?.isHost) {
      return NextResponse.json(
        { error: "Only the host can start the game" },
        { status: 403 }
      );
    }

    // Check if game is already in progress
    if (room.status !== "waiting") {
      return NextResponse.json(
        { error: "Game is already in progress or has ended" },
        { status: 400 }
      );
    }

    // Check minimum player count (at least 2 players)
    if (room.players.length < 2) {
      return NextResponse.json(
        { error: "At least 2 players are required to start the game" },
        { status: 400 }
      );
    }

    // Update room status and initialize game state
    const updatedRoom = {
      ...room,
      status: "playing" as GameStatus,
      currentRound: 1,
      startedAt: new Date().toISOString(),
    };

    // Save updated room state
    roomStore.setRoom(roomCode, updatedRoom);

    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.error("Error starting game:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
