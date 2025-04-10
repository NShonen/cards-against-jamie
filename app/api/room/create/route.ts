import { NextResponse } from "next/server";
import { roomStore, Room } from "../store";
import { nanoid } from "nanoid";
import { Card, Player } from "@/types/game";
import { z } from "zod";
import { AppError, handleValidationError } from "@/lib/error-utils";
import { handleRateLimit } from "@/lib/rate-limit";

// Sample data for testing
const sampleBlackCards: Card[] = [
  { id: "b1", type: "black", text: "Why can't I sleep at night?", pick: 1 },
  {
    id: "b2",
    type: "black",
    text: "I got 99 problems but _ ain't one.",
    pick: 1,
  },
  { id: "b3", type: "black", text: "What's that smell?", pick: 1 },
];

const sampleWhiteCards: Card[] = [
  { id: "w1", type: "white", text: "A windmill full of corpses." },
  { id: "w2", type: "white", text: "The Kool-Aid Man." },
  { id: "w3", type: "white", text: "Puppies!" },
  { id: "w4", type: "white", text: "Being on fire." },
  { id: "w5", type: "white", text: "A lifetime of sadness." },
  { id: "w6", type: "white", text: "Dragons." },
];

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

    const { roomName, password, winCondition } = validationResult.data;

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

    // Create sample players with hands
    const samplePlayers: Player[] = [
      {
        id: "p1",
        name: "Player 1",
        hand: sampleWhiteCards.slice(0, 3),
        isCardCzar: true,
        score: 0,
        isHost: true,
      },
      {
        id: "p2",
        name: "Player 2",
        hand: sampleWhiteCards.slice(3, 6),
        isCardCzar: false,
        score: 0,
        isHost: false,
      },
    ];

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

    // Create new room with dummy data
    roomStore.setRoom(roomCode, {
      roomName,
      password,
      createdAt: new Date(),
      players: samplePlayers,
      status: "waiting",
      currentRound: 1,
      blackCard: sampleBlackCards[0],
      submittedCards: [],
      scores: samplePlayers.map((player) => ({
        playerId: player.id,
        score: 0,
      })),
      winCondition: validatedWinCondition,
      winner: null,
    });

    // Return room code without exposing password
    return NextResponse.json({
      roomCode,
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
