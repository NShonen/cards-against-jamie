import { NextResponse } from "next/server";
import { roomStore } from "../store";
import { nanoid } from "nanoid";
import { Card, Player } from "@/types/game";

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

const generateRoomCode = () => nanoid(6).toUpperCase();

export async function POST(request: Request) {
  try {
    const { roomName, password } = await request.json();

    if (!roomName) {
      return NextResponse.json(
        { error: "Room name is required" },
        { status: 400 }
      );
    }

    const roomCode = generateRoomCode();

    // Create sample players with hands
    const samplePlayers: Player[] = [
      {
        id: "p1",
        name: "Player 1",
        hand: sampleWhiteCards.slice(0, 3),
        isCardCzar: true,
        score: 0,
      },
      {
        id: "p2",
        name: "Player 2",
        hand: sampleWhiteCards.slice(3, 6),
        isCardCzar: false,
        score: 0,
      },
    ];

    // Create new room with dummy data
    roomStore.setRoom(roomCode, {
      roomName,
      password,
      createdAt: new Date(),
      players: samplePlayers,
      status: "playing",
      currentRound: 1,
      blackCard: sampleBlackCards[0],
      submittedCards: [
        {
          playerId: "p2",
          cards: [sampleWhiteCards[3]],
        },
      ],
      scores: [
        { playerId: "p1", score: 0 },
        { playerId: "p2", score: 2 },
      ],
    });

    // Return room code without exposing password
    return NextResponse.json({ roomCode });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}
