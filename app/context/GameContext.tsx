"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import {
  GameState,
  GameAction,
  GamePhase,
  Player,
  Card,
  Round,
} from "../../types/game";
import { getPlayerInfo } from "@/lib/localStorage";
import { supabase } from "@/lib/supabaseClient";

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
  winCondition: {
    type: "score",
    target: 5, // Default: first to 5 points wins
  },
  winner: null,
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
      const newRoundNumber = state.roundNumber + 1;
      let roundWinner: Player | null = null;

      // Check for winner in rounds-based games
      if (
        state.winCondition.type === "rounds" &&
        newRoundNumber >= state.winCondition.target
      ) {
        // Find player with highest score
        roundWinner = state.players.reduce((highest: Player, current: Player) =>
          (current.score || 0) > (highest.score || 0) ? current : highest
        );
      }

      return {
        ...state,
        phase: roundWinner ? "gameEnd" : "scoring",
        roundNumber: newRoundNumber,
        winner: roundWinner,
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

      // Create new players array with updated score
      const updatedPlayers = state.players.map((player: Player) =>
        player.id === action.payload.winningSubmission.playerId
          ? { ...player, score: (player.score || 0) + 1 }
          : player
      );

      // Check for game winner
      const winner = updatedPlayers.find((player: Player) => {
        if (state.winCondition.type === "score") {
          return (player.score || 0) >= state.winCondition.target;
        }
        return false; // For rounds-based games, we check at round end
      });

      return {
        ...state,
        phase: winner ? "gameEnd" : "scoring",
        currentRound: {
          ...state.currentRound,
          winningSubmission: action.payload.winningSubmission,
        },
        players: updatedPlayers,
        winner: winner || null,
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
        players: state.players.map((player: Player) => ({
          ...player,
          isCardCzar: player.id === action.payload.playerId,
        })),
      };

    case "SET_WINNER":
      return {
        ...state,
        winner: action.payload.winner,
        phase: "gameEnd",
      };

    case "SET_ROOM_ID":
      return {
        ...state,
        roomId: action.payload.roomId,
      };

    case "SET_WIN_CONDITION":
      return {
        ...state,
        winCondition: action.payload.winCondition,
      };

    case "SET_PLAYERS":
      return {
        ...state,
        players: action.payload.players,
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

  useEffect(() => {
    const { roomCode } = getPlayerInfo(); // or use state.roomId directly

    if (!roomCode) return;

    const channel = supabase
      .channel(`players:room:${roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `room_code=eq.${roomCode}`,
        },
        async () => {
          // Re-fetch full player list on any change
          const { data, error } = await supabase
            .from("players")
            .select("*")
            .eq("room_code", roomCode);

          if (error) {
            console.error("Error fetching players:", error);
            return;
          }

          dispatch({
            type: "SET_PLAYERS",
            payload: {
              players: data,
            },
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [state.roomId]);

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
