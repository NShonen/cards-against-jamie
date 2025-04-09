"use client";

import { useEffect, useRef } from "react";
import { useSocket } from "@/app/context/SocketContext";
import { SocketService } from "@/services/socketService";
import { Room } from "@/types/socket";
import { useToast } from "@/components/ui/use-toast";

export function useSocketEvents() {
  const { socket, isConnected } = useSocket();
  const socketService = useRef<SocketService | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (socket) {
      socketService.current = new SocketService(socket);
    }
  }, [socket]);

  useEffect(() => {
    if (socketService.current) {
      // Set up error handling
      socketService.current.onError((message) => {
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      });
    }

    return () => {
      socketService.current?.removeAllListeners();
    };
  }, [toast]);

  const createRoom = async (playerName: string): Promise<string> => {
    if (!socketService.current) throw new Error("Socket not initialized");
    return socketService.current.createRoom(playerName);
  };

  const joinRoom = (roomId: string, playerName: string) => {
    if (!socketService.current) throw new Error("Socket not initialized");
    socketService.current.joinRoom(roomId, playerName);
  };

  const onRoomJoined = (callback: (room: Room) => void) => {
    if (!socketService.current) throw new Error("Socket not initialized");
    socketService.current.onRoomJoined(callback);
  };

  const onRoomUpdated = (callback: (room: Room) => void) => {
    if (!socketService.current) throw new Error("Socket not initialized");
    socketService.current.onRoomUpdated(callback);
  };

  const startGame = (roomId: string) => {
    if (!socketService.current) throw new Error("Socket not initialized");
    socketService.current.startGame(roomId);
  };

  const submitCards = (roomId: string, cards: string[]) => {
    if (!socketService.current) throw new Error("Socket not initialized");
    socketService.current.submitCards(roomId, cards);
  };

  const onJudgingStarted = (
    callback: (submissions: { [playerId: string]: string[] }) => void
  ) => {
    if (!socketService.current) throw new Error("Socket not initialized");
    socketService.current.onJudgingStarted(callback);
  };

  const selectWinner = (roomId: string, playerId: string) => {
    if (!socketService.current) throw new Error("Socket not initialized");
    socketService.current.selectWinner(roomId, playerId);
  };

  const leaveRoom = (roomId: string) => {
    if (!socketService.current) throw new Error("Socket not initialized");
    socketService.current.leaveRoom(roomId);
  };

  return {
    isConnected,
    createRoom,
    joinRoom,
    onRoomJoined,
    onRoomUpdated,
    startGame,
    submitCards,
    onJudgingStarted,
    selectWinner,
    leaveRoom,
  };
}
