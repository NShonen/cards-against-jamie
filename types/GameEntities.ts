export interface Player {
  id: string;
  name: string;
  score: number;
  isCardCzar: boolean;
  hand: Card[];
}

export interface Card {
  id: string;
  text: string;
  type: "black" | "white";
  pick?: number; // For black cards
}

export interface GameRoom {
  id: string;
  name: string;
  players: Player[];
  deck: Card[];
  state: GameState;
  status: GameStatus;
  currentRound: number;
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

export type GameState = "waiting" | "in-progress" | "completed";

export type GameStatus =
  | "waiting"
  | "playing"
  | "judging"
  | "roundEnd"
  | "gameEnd";
