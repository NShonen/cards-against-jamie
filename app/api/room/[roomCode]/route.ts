import { NextResponse } from "next/server";
import { roomStore } from "../store";
import { z } from "zod";

// Validation schema for room join request
const joinRoomSchema = z.object({
  playerName: z
    .string()
    .min(2, "Player name must be at least 2 characters long")
    .max(20, "Player name must be at most 20 characters long")
    .regex(
      /^[a-zA-Z0-9\s-]+$/,
      "Player name can only contain letters, numbers, spaces, and hyphens"
    ),
  password: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const roomCode = req.url.split("/").pop();
    if (!roomCode) {
      return NextResponse.json(
        { error: "Room code is required" },
        { status: 400 }
      );
    }

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
      winCondition: room.winCondition,
      hasPassword: !!room.password,
    });
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch room",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const roomCode = req.url.split("/").pop();
    if (!roomCode) {
      return NextResponse.json(
        { error: "Room code is required" },
        { status: 400 }
      );
    }

    const room = roomStore.getRoom(roomCode);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Check if room is full (max 20 players)
    if (room.players.length >= 20) {
      return NextResponse.json({ error: "Room is full" }, { status: 409 });
    }

    // Check if game has already started
    if (room.status !== "waiting") {
      return NextResponse.json(
        { error: "Game has already started" },
        { status: 409 }
      );
    }

    const body = await req.json();

    // Validate request body
    const validationResult = joinRoomSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const { playerName, password } = validationResult.data;

    // Check if player name is already taken in this room
    if (
      room.players.some(
        (p) => p.name.toLowerCase() === playerName.toLowerCase()
      )
    ) {
      return NextResponse.json(
        { error: "Player name is already taken in this room" },
        { status: 409 }
      );
    }

    // Verify password if room is password protected
    if (room.password && password !== room.password) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
      );
    }

    // Add player to room
    const newPlayer = {
      id: `p${room.players.length + 1}`,
      name: playerName,
      hand: [],
      isCardCzar: false,
      score: 0,
      isHost: room.players.length === 0,
    };

    room.players.push(newPlayer);
    room.scores.push({
      playerId: newPlayer.id,
      score: 0,
    });

    roomStore.setRoom(roomCode, room);

    return NextResponse.json({
      playerId: newPlayer.id,
      isHost: newPlayer.isHost,
    });
  } catch (error) {
    console.error("Error joining room:", error);
    return NextResponse.json(
      {
        error: "Failed to join room",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const roomCode = req.url.split("/").pop();
    if (!roomCode) {
      return NextResponse.json(
        { error: "Room code is required" },
        { status: 400 }
      );
    }

    const room = roomStore.getRoom(roomCode);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const { playerId } = await req.json();
    if (!playerId) {
      return NextResponse.json(
        { error: "Player ID is required" },
        { status: 400 }
      );
    }

    // Remove player from room
    const playerIndex = room.players.findIndex((p) => p.id === playerId);
    if (playerIndex === -1) {
      return NextResponse.json(
        { error: "Player not found in room" },
        { status: 404 }
      );
    }

    const wasHost = room.players[playerIndex].isHost;
    room.players.splice(playerIndex, 1);

    // Remove player's score
    room.scores = room.scores.filter((s) => s.playerId !== playerId);

    // If there are no players left, delete the room
    if (room.players.length === 0) {
      roomStore.deleteRoom(roomCode);
      return NextResponse.json({ message: "Room deleted" });
    }

    // If the host left, assign a new host
    if (wasHost && room.players.length > 0) {
      room.players[0].isHost = true;
    }

    roomStore.setRoom(roomCode, room);

    return NextResponse.json({
      message: "Player removed from room",
      newHost: wasHost ? room.players[0].id : undefined,
    });
  } catch (error) {
    console.error("Error removing player from room:", error);
    return NextResponse.json(
      {
        error: "Failed to remove player from room",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
