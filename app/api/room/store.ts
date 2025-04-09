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
  winCondition: {
    type: "score" | "rounds";
    target: number;
  };
  winner: Player | null;
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

  updateScore(roomCode: string, playerId: string, newScore: number): void {
    const room = this.getRoom(roomCode);
    if (!room) return;

    // Update player score
    room.players = room.players.map((player) =>
      player.id === playerId ? { ...player, score: newScore } : player
    );

    // Update scores array
    room.scores = room.scores.map((score) =>
      score.playerId === playerId ? { ...score, score: newScore } : score
    );

    // Check win condition
    if (
      room.winCondition.type === "score" &&
      newScore >= room.winCondition.target
    ) {
      room.winner = room.players.find((p) => p.id === playerId) || null;
      room.status = "completed";
    } else if (
      room.winCondition.type === "rounds" &&
      room.currentRound >= room.winCondition.target
    ) {
      // Find player with highest score
      room.winner = room.players.reduce((highest, current) =>
        (current.score || 0) > (highest.score || 0) ? current : highest
      );
      room.status = "completed";
    }

    this.setRoom(roomCode, room);
  },

  getWinner(roomCode: string): Player | null {
    const room = this.getRoom(roomCode);
    return room?.winner || null;
  },

  resetScores(roomCode: string): void {
    const room = this.getRoom(roomCode);
    if (!room) return;

    room.players = room.players.map((player) => ({ ...player, score: 0 }));
    room.scores = room.players.map((player) => ({
      playerId: player.id,
      score: 0,
    }));
    room.winner = null;

    this.setRoom(roomCode, room);
  },
};
