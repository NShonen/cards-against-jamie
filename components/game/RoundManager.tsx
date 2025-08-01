"use client";

import React, { useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useGame } from "@/app/context/GameContext";
import { CardCzarInterface } from "@/components/game/CardCzarInterface";

export function RoundManager() {
  const { state, dispatch } = useGame();
  const { toast } = useToast();

  const startNewRound = useCallback(() => {
    // Validate required state
    if (!state.players?.length || !state.blackDeck?.length) {
      console.error("Cannot start new round: missing players or black deck");
      return;
    }

    // Select a new Card Czar
    const currentCzarIndex = state.players.findIndex((p) => p.isCardCzar);
    const nextCzarIndex = (currentCzarIndex + 1) % state.players.length;
    const nextCardCzar = state.players[nextCzarIndex];

    if (!nextCardCzar) {
      console.error("Cannot start new round: invalid card czar");
      return;
    }

    // Update Card Czar
    dispatch({
      type: "SET_CARD_CZAR",
      payload: { playerId: nextCardCzar.id },
    });

    // Draw a new black card
    const [newBlackCard, ...remainingBlackDeck] = state.blackDeck;

    if (!newBlackCard) {
      console.error("Cannot start new round: no black cards available");
      return;
    }

    // Create new round
    const newRound = {
      id: state.roundNumber + 1,
      blackCard: newBlackCard,
      cardCzarId: nextCardCzar.id,
      submissions: [],
      timeRemaining: state.roundTimeLimit,
    };

    dispatch({
      type: "START_ROUND",
      payload: { round: newRound },
    });

    toast({
      title: "New Round Started",
      description: `${nextCardCzar.name} is the new Card Czar!`,
    });
  }, [
    state.players,
    state.blackDeck,
    state.roundNumber,
    state.roundTimeLimit,
    dispatch,
    toast,
  ]);

  // Timer effect
  useEffect(() => {
    if (!state.currentRound || state.phase !== "playing") return;

    const currentRound = state.currentRound;
    const timer = setInterval(() => {
      const timeRemaining = currentRound.timeRemaining - 1;

      if (timeRemaining <= 0) {
        clearInterval(timer);
        dispatch({
          type: "END_ROUND",
          payload: { timeExpired: true },
        });
        toast({
          title: "Time's Up!",
          description: "The round has ended.",
          variant: "destructive",
        });
      } else {
        dispatch({
          type: "UPDATE_TIMER",
          payload: { timeRemaining },
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [state.currentRound, state.phase, dispatch, toast]);

  // Auto-start new round when scoring phase ends
  useEffect(() => {
    if (state.phase === "scoring") {
      const timer = setTimeout(() => {
        startNewRound();
      }, 5000); // Show scores for 5 seconds before starting new round

      return () => clearTimeout(timer);
    }
  }, [state.phase, startNewRound]);

  // Early return if no current round
  if (!state.currentRound) {
    return null;
  }

  // Calculate progress percentage safely
  const progressPercentage = state.roundTimeLimit
    ? (state.currentRound.timeRemaining / state.roundTimeLimit) * 100
    : 0;

  // Find winner name safely
  const winnerName = state.currentRound.winningSubmission
    ? state.players?.find(
        (p) => p.id === state.currentRound?.winningSubmission?.playerId
      )?.name || "Unknown Player"
    : null;

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Round {state.roundNumber || 1}</h2>
          <div className="text-sm text-muted-foreground">
            Time Remaining: {state.currentRound.timeRemaining}s
          </div>
        </div>

        <Progress value={progressPercentage} className="mb-4" />

        {state.currentRound.blackCard && (
          <Alert>
            <AlertTitle>Black Card</AlertTitle>
            <AlertDescription className="text-lg">
              {state.currentRound.blackCard.text}
            </AlertDescription>
          </Alert>
        )}

        {state.phase === "scoring" && state.currentRound.winningSubmission && winnerName && (
          <Alert className="mt-4" variant="default">
            <AlertTitle>Winner!</AlertTitle>
            <AlertDescription>
              {winnerName} wins this round!
            </AlertDescription>
          </Alert>
        )}
      </Card>

      {/* Add Card Czar Interface */}
      <CardCzarInterface />
    </div>
  );
}
