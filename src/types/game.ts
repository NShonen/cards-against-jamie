export interface Card {
  id: string;
  type: "black" | "white";
  text: string;
  pick?: number; // For black cards
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  isCardCzar: boolean;
  score: number;
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
