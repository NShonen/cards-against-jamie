"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import RoomCreation from "@/components/room/RoomCreation";
import RoomJoin from "@/components/room/RoomJoin";
import { RoundManager } from "@/components/game/RoundManager";
import { Scoreboard } from "@/components/game/Scoreboard";
import { GameResultsModal } from "@/components/game/GameResultsModal";
import { GameProvider } from "@/app/context/GameContext";
import { Toaster } from "@/components/ui/toaster";
import { useGame } from "@/app/context/GameContext";

// Wrapper component for game-specific components that depend on game state
function GameComponents() {
  const { state } = useGame();

  // Only show game components if we're in an active game phase
  if (state.phase === "waiting" || !state.currentRound) {
    return null;
  }

  return (
    <div className="space-y-8">
      <RoundManager />
      <Scoreboard />
    </div>
  );
}

export default function GameRoomPage() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 md:py-8 lg:py-12">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Game Room</h1>
              <p className="text-muted-foreground">
                Create or join a game room to start playing
              </p>
            </div>
          </div>

          {/* Mobile View: Tabs */}
          <div className="block lg:hidden">
            <Tabs defaultValue="create" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="create">Create Room</TabsTrigger>
                <TabsTrigger value="join">Join Room</TabsTrigger>
              </TabsList>
              <ScrollArea className="h-[calc(100vh-16rem)]">
                <TabsContent value="create" className="mt-0 space-y-4">
                  <RoomCreation />
                </TabsContent>
                <TabsContent value="join" className="mt-0 space-y-4">
                  <RoomJoin />
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>

          {/* Desktop View: Side by Side */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Create Room
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Start a new game room
                  </p>
                </div>
              </div>
              <Separator />
              <RoomCreation />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Join Room
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Enter an existing room
                  </p>
                </div>
              </div>
              <Separator />
              <RoomJoin />
            </div>
          </div>

          {/* Game Components */}
          <GameComponents />
        </div>
      </div>
      <GameResultsModal />
      <Toaster />
    </GameProvider>
  );
}
