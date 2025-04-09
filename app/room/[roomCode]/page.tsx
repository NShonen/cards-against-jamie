"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { GameLayout } from "@/components/layout/GameLayout";
import CardSelection from "@/components/game/CardSelection";
import { Card, GameRoom as GameRoomType, GameStatus } from "@/types/game";
import { selectRooms, updateRoom, addRoom } from "@/state/gameReducer";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

interface RoomData {
  roomName: string;
  createdAt: string;
  players: GameRoomType["players"];
  status: GameStatus;
  currentRound: number;
  blackCard: Card | null;
  submittedCards: GameRoomType["submittedCards"];
  scores: GameRoomType["scores"];
}

export default function RoomPage() {
  const { roomCode } = useParams();
  const [room, setRoom] = useState<RoomData | null>(null);
  const [error, setError] = useState("");
  const dispatch = useAppDispatch();
  const gameRooms = useAppSelector(selectRooms);
  const currentGameRoom = gameRooms.find((r) => r.id === roomCode);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/room/${roomCode}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch room");
        }

        setRoom(data);

        // Update Redux store with room data
        if (!currentGameRoom) {
          dispatch(
            addRoom({
              id: roomCode as string,
              name: data.roomName,
              players: data.players || [],
              status: data.status || "waiting",
              currentRound: data.currentRound || 0,
              blackCard: data.blackCard || null,
              submittedCards: data.submittedCards || [],
              scores: data.scores || [],
              deck: [], // This should be initialized properly
              state: "in-progress",
            })
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    };

    fetchRoom();
  }, [roomCode, dispatch, currentGameRoom]);

  const handleCardSelect = (card: Card) => {
    if (!currentGameRoom) return;

    // Only allow card selection during playing phase
    if (currentGameRoom.status !== "playing") return;

    // Check if user is card czar
    const currentPlayer = currentGameRoom.players.find((p) => p.isCardCzar);
    if (currentPlayer?.isCardCzar) return; // Card czar can't submit cards

    // Add selected card to submitted cards
    const updatedRoom = {
      ...currentGameRoom,
      submittedCards: [
        ...currentGameRoom.submittedCards,
        {
          playerId: currentPlayer?.id || "",
          cards: [card],
        },
      ],
    };

    dispatch(updateRoom(updatedRoom));
  };

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="p-4">
        <div>Loading room...</div>
      </div>
    );
  }

  return (
    <GameLayout>
      <div className="p-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Room: {room.roomName}</h1>
          <div className="text-sm text-gray-500">Room Code: {roomCode}</div>
        </div>

        {currentGameRoom && (
          <div className="space-y-8">
            {/* Game Status */}
            <div className="bg-secondary p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Game Status</h2>
              <p>Current Round: {currentGameRoom.currentRound}</p>
              <p>Status: {currentGameRoom.status}</p>
            </div>

            {/* Black Card Display */}
            {currentGameRoom.blackCard && (
              <div className="bg-black text-white p-6 rounded-lg max-w-md">
                <h3 className="text-lg font-semibold mb-2">Black Card</h3>
                <p>{currentGameRoom.blackCard.text}</p>
              </div>
            )}

            {/* Player's Hand */}
            {currentGameRoom.players.map((player) => (
              <div key={player.id} className="mt-6">
                <h3 className="text-lg font-semibold mb-4">
                  {player.name}'s Hand {player.isCardCzar && "(Card Czar)"}
                </h3>
                <CardSelection
                  cards={player.hand}
                  onCardSelect={handleCardSelect}
                  disabled={
                    player.isCardCzar || currentGameRoom.status !== "playing"
                  }
                />
              </div>
            ))}

            {/* Scores */}
            <div className="bg-secondary p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Scores</h2>
              <div className="space-y-2">
                {currentGameRoom.scores.map((score) => (
                  <div key={score.playerId} className="flex justify-between">
                    <span>
                      {
                        currentGameRoom.players.find(
                          (p) => p.id === score.playerId
                        )?.name
                      }
                    </span>
                    <span>{score.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
}
