import { Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  Room,
} from "@/types/socket";
import {
  ROOM_EVENTS,
  GAME_EVENTS,
  ROUND_EVENTS,
  CARD_EVENTS,
  JUDGING_EVENTS,
  PLAYER_EVENTS,
  ERROR_EVENTS,
} from "@/constants/socketEvents";

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export class SocketService {
  private socket: GameSocket;

  constructor(socket: GameSocket) {
    this.socket = socket;
  }

  // Room Events
  public createRoom(playerName: string): Promise<string> {
    return new Promise((resolve) => {
      this.socket.emit(ROOM_EVENTS.CREATE, playerName, (roomId: string) => {
        resolve(roomId);
      });
    });
  }

  public joinRoom(roomId: string, playerName: string): void {
    this.socket.emit(ROOM_EVENTS.JOIN, roomId, playerName);
  }

  public onRoomJoined(callback: (room: Room) => void): void {
    this.socket.on(ROOM_EVENTS.JOINED, callback);
  }

  public onRoomUpdated(callback: (room: Room) => void): void {
    this.socket.on(ROOM_EVENTS.UPDATED, callback);
  }

  // Game Events
  public startGame(roomId: string): void {
    this.socket.emit(GAME_EVENTS.START, roomId);
  }

  public onGameStarted(callback: (room: Room) => void): void {
    this.socket.on(GAME_EVENTS.STARTED, callback);
  }

  public onGameEnded(
    callback: (finalScores: { [playerId: string]: number }) => void
  ): void {
    this.socket.on(GAME_EVENTS.ENDED, callback);
  }

  // Card Events
  public submitCards(roomId: string, cards: string[]): void {
    this.socket.emit(CARD_EVENTS.SUBMIT, roomId, cards);
  }

  public onCardsSubmitted(callback: (submittedCount: number) => void): void {
    this.socket.on(CARD_EVENTS.SUBMITTED, callback);
  }

  // Judging Events
  public onJudgingStarted(
    callback: (submissions: { [playerId: string]: string[] }) => void
  ): void {
    this.socket.on(JUDGING_EVENTS.START, callback);
  }

  public selectWinner(roomId: string, playerId: string): void {
    this.socket.emit(JUDGING_EVENTS.SELECT_WINNER, roomId, playerId);
  }

  // Player Events
  public leaveRoom(roomId: string): void {
    this.socket.emit(PLAYER_EVENTS.LEAVE, roomId);
  }

  // Error Handling
  public onError(callback: (message: string) => void): void {
    this.socket.on(ERROR_EVENTS.ERROR, callback);
  }

  // Cleanup
  public removeAllListeners(): void {
    this.socket.removeAllListeners();
  }

  // Connection Status
  public isConnected(): boolean {
    return this.socket.connected;
  }
}
