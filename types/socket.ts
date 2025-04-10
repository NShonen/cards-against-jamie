// Player Types
export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  isCardCzar: boolean;
  hand: Card[];
  selectedCards?: string[]; // Keep this for socket-specific functionality
}

export interface Card {
  id: string;
  text: string;
  type: "black" | "white";
  pick?: number;
}

// Room Types
export interface Room {
  id: string;
  hostId: string;
  players: Player[];
  currentRound: number;
  gameState: GameState;
  blackCard?: string;
  submittedCards: { [playerId: string]: string[] };
  winningCards?: { playerId: string; cards: string[] };
}

// Game State
export enum GameState {
  WAITING = "waiting",
  PLAYING = "playing",
  JUDGING = "judging",
  ROUND_END = "round_end",
  GAME_END = "game_end",
}

// Server -> Client Events
export interface ServerToClientEvents {
  "room:joined": (room: Room) => void;
  "room:updated": (room: Room) => void;
  "game:started": (room: Room) => void;
  "round:started": (blackCard: string) => void;
  "cards:submitted": (submittedCount: number) => void;
  "cards:dealt": (cards: string[]) => void;
  "judging:started": (submissions: { [playerId: string]: string[] }) => void;
  "round:ended": (winner: { playerId: string; cards: string[] }) => void;
  "game:ended": (finalScores: { [playerId: string]: number }) => void;
  error: (message: string) => void;
}

// Client -> Server Events
export interface ClientToServerEvents {
  "room:create": (
    playerName: string,
    callback: (roomId: string) => void
  ) => void;
  "room:join": (roomId: string, playerName: string) => void;
  "game:start": (roomId: string) => void;
  "cards:submit": (roomId: string, cards: string[]) => void;
  "winner:select": (roomId: string, playerId: string) => void;
  "player:leave": (roomId: string) => void;
}

// Inter-Server Events
export interface InterServerEvents {
  ping: () => void;
}

// Socket Data
export interface SocketData {
  playerId: string;
  playerName: string;
  roomId?: string;
}
