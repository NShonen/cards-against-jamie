import { configureStore } from "@reduxjs/toolkit";
import gameReducer from "@/state/gameReducer";
import roomReducer from "./slices/roomSlice";

export const store = configureStore({
  reducer: {
    game: gameReducer,
    room: roomReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
