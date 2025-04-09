import { Card, GameStatus, Player } from "@/types/game";

export interface Room {
  roomName: string;
  password?: string;
  createdAt: Date;
  players: Player[];
  status: GameStatus;
  currentRound: number;
  blackCard: Card | null;
  submittedCards: { playerId: string; cards: Card[] }[];
  scores: { playerId: string; score: number }[];
}

// Using global object to persist data between requests in development
// In production, this should be replaced with a proper database
declare global {
  var rooms: Map<string, Room> | undefined;
}

// Initialize the global rooms Map if it doesn't exist
global.rooms = global.rooms || new Map<string, Room>();

export const roomStore = {
  getRoom(roomCode: string): Room | undefined {
    return global.rooms!.get(roomCode);
  },

  setRoom(roomCode: string, room: Room): void {
    global.rooms!.set(roomCode, room);
    console.log("Current rooms:", Array.from(global.rooms!.entries()));
  },

  deleteRoom(roomCode: string): boolean {
    return global.rooms!.delete(roomCode);
  },

  listRooms(): Room[] {
    return Array.from(global.rooms!.values());
  },
};
