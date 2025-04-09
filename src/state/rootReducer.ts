import { combineReducers } from "@reduxjs/toolkit";
import gameReducer from "./gameReducer";

const rootReducer = combineReducers({
  game: gameReducer,
});

export default rootReducer;
