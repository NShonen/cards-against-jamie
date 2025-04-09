import { Server, Socket } from "socket.io";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  Room,
  GameState,
  Player,
} from "@/types/socket";
import {
  ROOM_EVENTS,
  GAME_EVENTS,
  ROUND_EVENTS,
  CARD_EVENTS,
  JUDGING_EVENTS,
} from "@/constants/socketEvents";

type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;

export class EventPropagationService {
  private io: GameServer;
  private roomSockets: Map<string, Set<string>> = new Map(); // roomId -> Set of socketIds

  constructor(io: GameServer) {
    this.io = io;
  }

  // Room Management
  public addToRoom(socket: GameSocket, roomId: string) {
    socket.join(roomId);
    if (!this.roomSockets.has(roomId)) {
      this.roomSockets.set(roomId, new Set());
    }
    this.roomSockets.get(roomId)!.add(socket.id);
  }

  public removeFromRoom(socket: GameSocket, roomId: string) {
    socket.leave(roomId);
    this.roomSockets.get(roomId)?.delete(socket.id);
    if (this.roomSockets.get(roomId)?.size === 0) {
      this.roomSockets.delete(roomId);
    }
  }

  // Event Propagation Rules
  public async propagateRoomJoin(room: Room) {
    // Broadcast to all players in the room
    this.io.to(room.id).emit(ROOM_EVENTS.JOINED, room);
  }

  public async propagateRoomUpdate(room: Room) {
    // Broadcast to all players in the room
    this.io.to(room.id).emit(ROOM_EVENTS.UPDATED, room);
  }

  public async propagateGameStart(room: Room) {
    // Broadcast game start to all players
    this.io.to(room.id).emit(GAME_EVENTS.STARTED, room);
  }

  public async propagateRoundStart(
    roomId: string,
    blackCard: string,
    players: Player[]
  ) {
    // Send black card to all players
    this.io.to(roomId).emit(ROUND_EVENTS.STARTED, blackCard);

    // Send individual white cards to each player (except Card Czar)
    players.forEach((player) => {
      if (!player.isCardCzar) {
        const playerSocket = this.getSocketByPlayerId(player.id);
        if (playerSocket) {
          // In a real implementation, you would get cards from your card service
          const whiteCards = ["card1", "card2", "card3"]; // Placeholder
          playerSocket.emit(CARD_EVENTS.DEALT, whiteCards);
        }
      }
    });
  }

  public async propagateCardSubmission(roomId: string, submittedCount: number) {
    // Notify all players about submission progress
    this.io.to(roomId).emit(CARD_EVENTS.SUBMITTED, submittedCount);
  }

  public async propagateJudgingStart(
    roomId: string,
    submissions: { [playerId: string]: string[] }
  ) {
    // Send anonymized submissions to all players
    const anonymizedSubmissions = this.anonymizeSubmissions(submissions);
    this.io.to(roomId).emit(JUDGING_EVENTS.START, anonymizedSubmissions);
  }

  public async propagateRoundEnd(
    roomId: string,
    winner: { playerId: string; cards: string[] }
  ) {
    // Broadcast round results to all players
    this.io.to(roomId).emit(ROUND_EVENTS.ENDED, winner);
  }

  public async propagateGameEnd(
    roomId: string,
    finalScores: { [playerId: string]: number }
  ) {
    // Broadcast final scores to all players
    this.io.to(roomId).emit(GAME_EVENTS.ENDED, finalScores);
  }

  public async propagateError(socketId: string, message: string) {
    // Send error only to the affected player
    this.io.to(socketId).emit("error", message);
  }

  // Helper Methods
  private getSocketByPlayerId(playerId: string): GameSocket | null {
    // In a real implementation, you would maintain a mapping of playerIds to socketIds
    return null;
  }

  private anonymizeSubmissions(submissions: { [playerId: string]: string[] }) {
    // Create a copy with randomized order and without player IDs
    const entries = Object.entries(submissions);
    for (let i = entries.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [entries[i], entries[j]] = [entries[j], entries[i]];
    }
    return Object.fromEntries(entries);
  }
}
