export interface Player {
  id: string;
  name: string;
  score: number;
  isCzar: boolean;
}

export interface Card {
  id: string;
  text: string;
  type: "black" | "white";
}

export interface GameRoom {
  id: string;
  name: string;
  players: Player[];
  deck: Card[];
  state: GameState;
}

export type GameState = "waiting" | "in-progress" | "completed";
