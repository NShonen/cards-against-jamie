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
import { useToast } from "@/components/ui/use-toast";
import { RoomJoin } from "@/components/room/RoomJoin";
import { RoomLobby } from "@/components/room/RoomLobby";
import { RoomGame } from "@/components/room/RoomGame";
import { RoomHeader } from "@/components/room/RoomHeader";
import { RoomFooter } from "@/components/room/RoomFooter";
import { selectRoom, setRoom } from "@/store/slices/roomSlice";
import { selectUser } from "@/store/slices/userSlice";

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
  const dispatch = useAppDispatch();
  const room = useAppSelector(selectRoom);
  const user = useAppSelector(selectUser);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        // TODO: Replace with actual API call to fetch room data
        const response = await fetch(`/api/rooms/${roomCode}`);
        if (!response.ok) {
          throw new Error("Failed to fetch room data");
        }
        const roomData = await response.json();
        dispatch(setRoom(roomData));
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch room data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [roomCode, dispatch, toast]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!room) {
    return <RoomJoin roomCode={roomCode as string} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <RoomHeader room={room} />
      <main className="flex-grow container mx-auto px-4 py-8">
        {room.gameState === "waiting" ? (
          <RoomLobby room={room} />
        ) : (
          <RoomGame room={room} />
        )}
      </main>
      <RoomFooter room={room} />
    </div>
  );
}
