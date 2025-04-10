// app/api/rooms/join/route.ts

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

const joinRoomSchema = z.object({
  roomCode: z.string().length(6, "Invalid room code"),
  password: z.string().optional(),
  playerName: z
    .string()
    .min(1, "Player name is required")
    .max(30, "Player name too long"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = joinRoomSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: parsed.error.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const { roomCode, password, playerName } = parsed.data;

    // 1. Fetch the room
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("code, name, password, status")
      .eq("code", roomCode)
      .maybeSingle();

    if (roomError) {
      console.error("Supabase error fetching room:", roomError);
      return NextResponse.json(
        { error: "Database error retrieving room" },
        { status: 500 }
      );
    }

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.password && room.password !== password) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 403 }
      );
    }

    // 2. Prevent duplicate player names (optional)
    const { data: existingPlayer, error: playerCheckError } = await supabase
      .from("players")
      .select("id")
      .eq("room_code", roomCode)
      .eq("name", playerName)
      .maybeSingle();

    if (playerCheckError) {
      return NextResponse.json(
        { error: "Error checking player name" },
        { status: 500 }
      );
    }

    if (existingPlayer) {
      return NextResponse.json(
        { error: "Player name already taken in this room" },
        { status: 409 }
      );
    }

    // 3. Insert player into `players` table
    const playerId = uuidv4();

    const { error: insertError } = await supabase.from("players").insert({
      id: playerId,
      room_code: roomCode,
      name: playerName,
      is_host: false,
      is_card_czar: false,
      score: 0,
    });

    if (insertError) {
      console.error("Supabase error creating player:", insertError);
      return NextResponse.json(
        { error: "Failed to register player" },
        { status: 500 }
      );
    }

    // ✅ Success
    return NextResponse.json({
      success: true,
      roomCode: room.code,
      roomName: room.name,
      status: room.status,
      playerId,
    });
  } catch (error) {
    console.error("Unhandled error in /api/rooms/join:", error);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
