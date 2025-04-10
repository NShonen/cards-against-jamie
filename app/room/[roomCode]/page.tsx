"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getPlayerInfo } from "@/lib/localStorage";
import { supabase } from "@/lib/supabaseClient";
import { useGame, GameProvider } from "@/app/context/GameContext";

function RoomContent() {
  const { state, dispatch } = useGame();
  const router = useRouter();
  const { roomCode } = useParams<{ roomCode: string }>();

  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { playerId } = getPlayerInfo();

    if (!roomCode || !playerId) {
      router.push("/game-room");
      return;
    }

    const fetchRoom = async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("code", roomCode)
        .maybeSingle();

      if (error || !data) {
        setError("Room not found or error loading.");
        return;
      }

      setRoom(data);

      dispatch({ type: "SET_ROOM_ID", payload: { roomId: roomCode } });
      dispatch({
        type: "SET_WIN_CONDITION",
        payload: {
          winCondition: {
            type: data.target_score ? "score" : "rounds",
            target: data.target_score || 5,
          },
        },
      });

      const { data: players } = await supabase
        .from("players")
        .select("*")
        .eq("room_code", roomCode);

      if (players) {
        dispatch({ type: "SET_PLAYERS", payload: { players } });
      }

      setLoading(false);
    };

    fetchRoom();
  }, [roomCode]);

  if (loading) return <div className="p-6">Loading room...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="container max-w-3xl py-10">
      <h1 className="text-3xl font-bold mb-4">Room: {room.name}</h1>
      <p className="text-muted-foreground mb-6">Code: {room.code}</p>

      <div className="mb-8">
        <p>
          Current Phase: <strong>{state.phase}</strong>
        </p>
        <p>Players in Room: {state.players.length}</p>
        <ul className="list-disc list-inside">
          {state.players.map((p) => (
            <li key={p.id}>
              {p.name} {p.isCardCzar ? "(Czar)" : ""}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Wrap RoomContent in GameProvider
export default function RoomPageWrapper() {
  return (
    <GameProvider>
      <RoomContent />
    </GameProvider>
  );
}
