export type GamePhase =
  | "waiting"
  | "playing"
  | "judging"
  | "scoring"
  | "roundEnd"
  | "gameEnd";

export interface Card {
  id: string;
  text: string;
  type: "black" | "white";
  pick?: number; // For black cards
  category?: string; // Card category for filtering and organization
  metadata?: Record<string, any>;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  isCardCzar: boolean;
  hand: Card[];
}

export interface Round {
  id: number;
  blackCard: Card;
  cardCzarId: string;
  submissions: {
    playerId: string;
    cards: Card[];
  }[];
  winningSubmission?: {
    playerId: string;
    cards: Card[];
  };
  timeRemaining: number;
}

export interface GameState {
  roomId: string;
  phase: GamePhase;
  players: Player[];
  currentRound: Round | null;
  roundNumber: number;
  blackDeck: Card[];
  whiteDeck: Card[];
  maxPlayers: number;
  minPlayers: number;
  roundTimeLimit: number; // in seconds
  winCondition: {
    type: "score" | "rounds";
    target: number;
  };
  winner: Player | null;
}

export interface GameAction {
  type:
    | "START_GAME"
    | "END_GAME"
    | "START_ROUND"
    | "END_ROUND"
    | "SUBMIT_CARDS"
    | "SELECT_WINNER"
    | "UPDATE_TIMER"
    | "SET_CARD_CZAR"
    | "SET_WIN_CONDITION"
    | "SET_WINNER"
    | "SET_PLAYERS"
    | "SET_ROOM_ID";
  payload: any;
}

export interface SubmittedCard {
  playerId: string;
  cards: Card[];
}

export interface PlayerScore {
  playerId: string;
  score: number;
}

// Legacy type alias for backward compatibility
export type GameStatus = "waiting" | "playing" | "completed";
