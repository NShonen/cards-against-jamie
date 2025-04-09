"use client";

import RoomCreation from "@/components/room/RoomCreation";
import RoomJoin from "@/components/room/RoomJoin";
import { RoundManager } from "@/components/game/RoundManager";
import { GameProvider } from "@/app/context/GameContext";
import { Toaster } from "@/components/ui/toaster";

export default function GameRoomPage() {
  return (
    <GameProvider>
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-8">Game Room</h1>
        <div className="grid gap-8">
          <RoomCreation />
          <RoomJoin />
          <RoundManager />
        </div>
      </div>
      <Toaster />
    </GameProvider>
  );
}
