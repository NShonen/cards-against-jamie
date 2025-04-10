"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { GameLayout } from "@/components/layout/GameLayout";
import CardSelection from "@/components/game/CardSelection";
import {
  Card,
  Player,
  GameStatus,
  SubmittedCard,
  PlayerScore,
} from "@/types/game";
import { selectRooms, updateRoom, addRoom } from "@/state/gameReducer";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card as CardUI,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSocketEvents } from "@/hooks/useSocketEvents";

interface RoomData {
  roomName: string;
  createdAt: string;
  players: Player[];
  status: GameStatus;
  currentRound: number;
  blackCard: Card | null;
  submittedCards: SubmittedCard[];
  scores: PlayerScore[];
}

export default function RoomPage() {
  const { roomCode } = useParams();
  const [room, setRoom] = useState<RoomData | null>(null);
  const [error, setError] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const dispatch = useAppDispatch();
  const rooms = useAppSelector(selectRooms);
  const currentGameRoom = rooms.find((r) => r.id === roomCode);
  const { onRoomJoined, onRoomUpdated, isConnected } = useSocketEvents();

  // Show loading state while socket connects
  useEffect(() => {
    if (!isConnected) {
      setError("Connecting to game server...");
    } else {
      setError("");
    }
  }, [isConnected]);

  useEffect(() => {
    // Only set up socket events if connected
    if (!isConnected) return;

    // Subscribe to room events
    onRoomJoined((updatedRoom) => {
      dispatch(
        updateRoom({
          id: roomCode as string,
          name: updatedRoom.name || room?.roomName || "",
          players: updatedRoom.players || [],
          status: updatedRoom.gameState || "waiting",
          currentRound: updatedRoom.currentRound || 0,
          blackCard: updatedRoom.blackCard || null,
          submittedCards: updatedRoom.submittedCards || [],
          scores: updatedRoom.players.map((p) => ({
            playerId: p.id,
            score: p.score || 0,
          })),
          deck: [],
          state: "in-progress",
        })
      );
    });

    onRoomUpdated((updatedRoom) => {
      dispatch(
        updateRoom({
          id: roomCode as string,
          name: updatedRoom.name || room?.roomName || "",
          players: updatedRoom.players || [],
          status: updatedRoom.gameState || "waiting",
          currentRound: updatedRoom.currentRound || 0,
          blackCard: updatedRoom.blackCard || null,
          submittedCards: updatedRoom.submittedCards || [],
          scores: updatedRoom.players.map((p) => ({
            playerId: p.id,
            score: p.score || 0,
          })),
          deck: [],
          state: "in-progress",
        })
      );
    });
  }, [
    dispatch,
    roomCode,
    room?.roomName,
    onRoomJoined,
    onRoomUpdated,
    isConnected,
  ]);

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
              deck: [],
              state: "in-progress",
            })
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    };

    // Only fetch room data if socket is connected
    if (isConnected) {
      fetchRoom();
    }
  }, [roomCode, dispatch, currentGameRoom, isConnected]);

  useEffect(() => {
    if (currentGameRoom) {
      // Find the current player from local storage or session
      const playerId = localStorage.getItem(`room_${roomCode}_player_id`);
      if (playerId) {
        const player = currentGameRoom.players.find((p) => p.id === playerId);
        if (player) {
          setCurrentPlayer(player);
        }
      }
    }
  }, [currentGameRoom, roomCode]);

  const handleCardSelect = (selectedCards: Card[]) => {
    if (!currentGameRoom || !currentPlayer) return;

    // Only allow card selection during playing phase
    if (currentGameRoom.status !== "playing") return;

    // Check if user is card czar
    const player = currentGameRoom.players.find(
      (p) => p.id === currentPlayer.id
    );
    if (player?.isCardCzar) return; // Card czar can't submit cards

    // Add selected cards to submitted cards
    const updatedRoom = {
      ...currentGameRoom,
      submittedCards: [
        ...currentGameRoom.submittedCards,
        {
          playerId: player?.id || "",
          cards: selectedCards,
        },
      ],
    };

    dispatch(updateRoom(updatedRoom));
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </Alert>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2 text-lg">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading room...
        </div>
      </div>
    );
  }

  return (
    <GameLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{room.roomName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">Room: {roomCode}</Badge>
              <Badge variant="secondary">
                Round {currentGameRoom?.currentRound || 0}
              </Badge>
              <Badge
                variant={
                  currentGameRoom?.status === "playing" ? "default" : "outline"
                }
              >
                {currentGameRoom?.status || "waiting"}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {currentGameRoom && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Game Info & Scores - Left Column */}
            <div className="lg:col-span-3 space-y-6">
              {/* Black Card Display */}
              {currentGameRoom.blackCard && (
                <CardUI className="bg-black text-white border-0">
                  <CardHeader>
                    <CardTitle>Black Card</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm md:text-base">
                      {currentGameRoom.blackCard.text}
                    </p>
                  </CardContent>
                </CardUI>
              )}

              {/* Scores */}
              <CardUI>
                <CardHeader>
                  <CardTitle>Scores</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[200px] px-6">
                    <div className="space-y-2 py-2">
                      {currentGameRoom.scores.map((score) => (
                        <div
                          key={score.playerId}
                          className="flex justify-between text-sm"
                        >
                          <span
                            className={cn(
                              "truncate max-w-[150px]",
                              currentGameRoom.players.find(
                                (p) => p.id === score.playerId
                              )?.isCardCzar && "font-medium"
                            )}
                          >
                            {
                              currentGameRoom.players.find(
                                (p) => p.id === score.playerId
                              )?.name
                            }
                            {currentGameRoom.players.find(
                              (p) => p.id === score.playerId
                            )?.isCardCzar && (
                              <Badge variant="secondary" className="ml-2">
                                Card Czar
                              </Badge>
                            )}
                          </span>
                          <span>{score.score}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </CardUI>
            </div>

            {/* Player's Hand - Right Column */}
            <div className="lg:col-span-9">
              <ScrollArea className="h-[calc(100vh-200px)]">
                {currentGameRoom.players.map((player) => (
                  <div key={player.id} className="mb-8 last:mb-0">
                    <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 py-2">
                      {player.name}
                      {player.isCardCzar && (
                        <Badge variant="secondary" className="ml-2">
                          Card Czar
                        </Badge>
                      )}
                    </h3>
                    <CardSelection
                      cards={player.hand}
                      onCardSelect={handleCardSelect}
                      disabled={
                        player.isCardCzar ||
                        currentGameRoom.status !== "playing"
                      }
                      maxSelections={currentGameRoom.blackCard?.pick || 1}
                      blackCard={currentGameRoom.blackCard}
                    />
                  </div>
                ))}
              </ScrollArea>
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
}
