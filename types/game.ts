export interface Card {
  id: string;
  type: "black" | "white";
  text: string;
  pick?: number; // For black cards
  category?: string; // Card category for filtering and organization
}

export interface Player {
  id: string;
  name: string;
  score: number;
  cards: Card[];
}

export interface GameRoom {
  id: string;
  password: string;
  players: Player[];
  status: GameStatus;
  currentRound: number;
  cardCzar: Player | null;
  blackCard: Card | null;
  submittedCards: SubmittedCard[];
  scores: PlayerScore[];
}

export interface SubmittedCard {
  playerId: string;
  cards: Card[];
}

export interface PlayerScore {
  playerId: string;
  score: number;
}

export type GameStatus =
  | "waiting"
  | "playing"
  | "judging"
  | "roundEnd"
  | "gameEnd";
