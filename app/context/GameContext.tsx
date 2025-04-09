"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import {
  GameState,
  GameAction,
  GamePhase,
  Player,
  Card,
  Round,
} from "../types/game";

const initialState: GameState = {
  roomId: "",
  phase: "waiting",
  players: [],
  currentRound: null,
  roundNumber: 0,
  blackDeck: [],
  whiteDeck: [],
  maxPlayers: 20,
  minPlayers: 3,
  roundTimeLimit: 120, // 2 minutes per round
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME":
      return {
        ...state,
        phase: "playing",
        roundNumber: 1,
      };

    case "END_GAME":
      return {
        ...state,
        phase: "waiting",
        currentRound: null,
        roundNumber: 0,
      };

    case "START_ROUND":
      return {
        ...state,
        phase: "playing",
        currentRound: action.payload.round,
      };

    case "END_ROUND":
      return {
        ...state,
        phase: "scoring",
        roundNumber: state.roundNumber + 1,
        currentRound: {
          ...state.currentRound!,
          winningSubmission: action.payload.winningSubmission,
        },
      };

    case "SUBMIT_CARDS":
      if (!state.currentRound) return state;
      const allPlayersSubmitted =
        state.currentRound.submissions.length === state.players.length - 1; // -1 for Card Czar

      return {
        ...state,
        phase: allPlayersSubmitted ? "judging" : state.phase,
        currentRound: {
          ...state.currentRound,
          submissions: [
            ...state.currentRound.submissions,
            action.payload.submission,
          ],
        },
      };

    case "SELECT_WINNER":
      if (!state.currentRound) return state;
      return {
        ...state,
        phase: "scoring",
        currentRound: {
          ...state.currentRound,
          winningSubmission: action.payload.winningSubmission,
        },
        players: state.players.map((player) =>
          player.id === action.payload.winningSubmission.playerId
            ? { ...player, score: player.score + 1 }
            : player
        ),
      };

    case "UPDATE_TIMER":
      if (!state.currentRound) return state;
      return {
        ...state,
        currentRound: {
          ...state.currentRound,
          timeRemaining: action.payload.timeRemaining,
        },
      };

    case "SET_CARD_CZAR":
      return {
        ...state,
        players: state.players.map((player) => ({
          ...player,
          isCardCzar: player.id === action.payload.playerId,
        })),
      };

    default:
      return state;
  }
}

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
