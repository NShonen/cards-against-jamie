import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Card, Player } from "../../types/game";
import { initializeDeck, shuffleDeck } from "../../utils/deckUtils";

interface GameState {
  deck: Card[];
  players: Player[];
}

const initialState: GameState = {
  deck: [],
  players: [],
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    initializeGame: (state, action: PayloadAction<Player[]>) => {
      state.players = action.payload;
      state.deck = shuffleDeck(initializeDeck());
    },
    distributeCards: (state) => {
      state.players.forEach((player) => {
        player.hand = state.deck.splice(0, 10);
      });
    },
  },
});

export const { initializeGame, distributeCards } = gameSlice.actions;
export default gameSlice.reducer;
