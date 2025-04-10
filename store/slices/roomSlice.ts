import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface RoomState {
  roomCode: string | null;
  roomName: string | null;
  playerId: string | null;
  playerName: string | null;
  winCondition: {
    type: "score" | "rounds";
    target: number;
  } | null;
  status: "waiting" | "playing" | "judging" | "roundEnd" | "gameEnd" | null;
}

const initialState: RoomState = {
  roomCode: null,
  roomName: null,
  playerId: null,
  playerName: null,
  winCondition: null,
  status: null,
};

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setRoom: (state, action: PayloadAction<Partial<RoomState>>) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    resetRoom: () => initialState,
  },
});

export const { setRoom, resetRoom } = roomSlice.actions;
export default roomSlice.reducer;
