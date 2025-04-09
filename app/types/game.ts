export type GamePhase = "waiting" | "playing" | "judging" | "scoring";

export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  isCardCzar: boolean;
  hand: Card[];
}

export interface Card {
  id: string;
  text: string;
  type: "black" | "white";
  metadata?: Record<string, any>;
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
    | "SET_CARD_CZAR";
  payload: any;
}
