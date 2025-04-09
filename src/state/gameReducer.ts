import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GameRoom } from "../types/GameEntities";

interface GameState {
  rooms: GameRoom[];
}

const initialState: GameState = {
  rooms: [],
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    addRoom(state, action: PayloadAction<GameRoom>) {
      state.rooms.push(action.payload);
    },
    removeRoom(state, action: PayloadAction<string>) {
      state.rooms = state.rooms.filter((room) => room.id !== action.payload);
    },
    updateRoom(state, action: PayloadAction<GameRoom>) {
      const index = state.rooms.findIndex(
        (room) => room.id === action.payload.id
      );
      if (index !== -1) {
        state.rooms[index] = action.payload;
      }
    },
  },
});

export const { addRoom, removeRoom, updateRoom } = gameSlice.actions;
export const selectRooms = (state: { game: GameState }) => state.game.rooms;
export default gameSlice.reducer;
