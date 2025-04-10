import { NextResponse } from "next/server";
import { roomStore, Room } from "../store";
import { nanoid } from "nanoid";
import { Card, Player } from "@/types/game";
import { z } from "zod";
import { AppError, handleValidationError } from "@/lib/error-utils";
import { handleRateLimit } from "@/lib/rate-limit";

// Validation schema
const createRoomSchema = z.object({
  roomName: z
    .string()
    .min(3, "Room name must be at least 3 characters long")
    .max(50, "Room name must be at most 50 characters long")
    .regex(
      /^[a-zA-Z0-9\s-]+$/,
      "Room name can only contain letters, numbers, spaces, and hyphens"
    ),
  password: z.string().optional(),
  winCondition: z
    .object({
      type: z.enum(["score", "rounds"]),
      target: z.number().int().min(1).max(20),
    })
    .optional(),
  hostName: z
    .string()
    .min(1, "Host name is required")
    .max(30, "Host name must be at most 30 characters"),
});

const generateRoomCode = () => nanoid(6).toUpperCase();

export async function POST(request: Request) {
  // Check rate limit first
  const rateLimitResponse = handleRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();

    // Validate request body
    const validationResult = createRoomSchema.safeParse(body);
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

    const { roomName, password, winCondition, hostName } =
      validationResult.data;

    // Check if room name is already taken
    const existingRooms = roomStore.getAllRooms();
    if (
      existingRooms.some(
        (room: Room) => room.roomName.toLowerCase() === roomName.toLowerCase()
      )
    ) {
      throw new AppError("Room name already exists", "ROOM_NAME_TAKEN");
    }

    // Generate unique room code
    let roomCode = generateRoomCode();
    let attempts = 0;
    const maxAttempts = 10;

    while (roomStore.getRoom(roomCode) && attempts < maxAttempts) {
      roomCode = generateRoomCode();
      attempts++;
    }

    if (attempts === maxAttempts) {
      throw new AppError(
        "Failed to generate unique room code. Please try again.",
        "ROOM_CODE_GENERATION_FAILED"
      );
    }

    // Create initial host player
    const hostPlayer: Player = {
      id: nanoid(), // Generate unique ID for the host
      name: hostName,
      hand: [], // Empty hand to start - cards will be dealt when game begins
      isCardCzar: true, // Host starts as card czar
      score: 0,
      isHost: true,
    };

    // Validate win condition
    const validatedWinCondition =
      winCondition &&
      (winCondition.type === "score" || winCondition.type === "rounds") &&
      typeof winCondition.target === "number" &&
      winCondition.target > 0
        ? winCondition
        : {
            type: "score" as const,
            target: 5, // Default: first to 5 points wins
          };

    // Create new room with real player data
    roomStore.setRoom(roomCode, {
      roomName,
      password,
      createdAt: new Date(),
      players: [hostPlayer], // Initialize with just the host player
      status: "waiting",
      currentRound: 1,
      blackCard: null, // No black card until game starts
      submittedCards: [],
      scores: [
        {
          playerId: hostPlayer.id,
          score: 0,
        },
      ],
      winCondition: validatedWinCondition,
      winner: null,
    });

    // Return room code and player info
    return NextResponse.json({
      roomCode,
      playerId: hostPlayer.id,
      winCondition: validatedWinCondition,
    });
  } catch (error) {
    console.error("Error creating room:", error);

    if (error instanceof AppError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          details: error.details,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create room",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
