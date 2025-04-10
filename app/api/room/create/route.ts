// app/api/rooms/create/route.ts

import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { supabase } from "@/lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

const createRoomSchema = z.object({
  roomName: z
    .string()
    .min(3, "Room name must be at least 3 characters long")
    .max(50, "Room name must be at most 50 characters long")
    .regex(/^[a-zA-Z0-9\s-]+$/, "Room name contains invalid characters"),
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
  const body = await request.json();
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

  const { roomName, password, winCondition, hostName } = validationResult.data;

  // Default win condition
  const validatedWinCondition =
    winCondition?.target && winCondition?.type
      ? winCondition
      : { type: "score" as const, target: 5 };

  let roomCode = generateRoomCode();
  let attempts = 0;

  while (attempts < 10) {
    const { data: existingRoom, error } = await supabase
      .from("rooms")
      .select("code")
      .eq("code", roomCode)
      .maybeSingle();

    if (!existingRoom) break;

    roomCode = generateRoomCode();
    attempts++;
  }

  if (attempts === 10) {
    return NextResponse.json(
      {
        error: "Could not generate a unique room code",
      },
      { status: 500 }
    );
  }

  // Insert new room
  const { error: roomError } = await supabase.from("rooms").insert({
    code: roomCode,
    name: roomName,
    password: password ?? null,
    status: "waiting",
    round_number: 1,
    target_score:
      validatedWinCondition.type === "score"
        ? validatedWinCondition.target
        : null,
  });

  if (roomError) {
    console.error("Failed to create room:", roomError);
    return NextResponse.json(
      { error: "Database error creating room" },
      { status: 500 }
    );
  }

  // Create the host player
  const playerId = uuidv4();

  const { error: playerError } = await supabase.from("players").insert({
    id: playerId,
    room_code: roomCode,
    name: hostName,
    is_host: true,
    is_card_czar: true,
    score: 0,
  });

  if (playerError) {
    console.error("Failed to create host player:", playerError);
    return NextResponse.json(
      { error: "Database error creating host player" },
      { status: 500 }
    );
  }

  await supabase.from("game_state").insert({
    room_code: roomCode,
    status: "waiting",
    black_card_id: null,
  });

  return NextResponse.json({
    roomCode,
    playerId,
    winCondition: validatedWinCondition,
  });
}
