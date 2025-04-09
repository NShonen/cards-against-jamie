"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useGame } from "@/app/context/GameContext";
import { useToast } from "@/components/ui/use-toast";

export function CardCzarInterface() {
  const { state, dispatch } = useGame();
  const { toast } = useToast();
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(
    null
  );

  // Only show if user is Card Czar and we're in judging phase
  const currentPlayer = state.players.find((p) => p.isCardCzar);
  if (
    !currentPlayer?.isCardCzar ||
    state.phase !== "judging" ||
    !state.currentRound
  ) {
    return null;
  }

  const handleWinnerSelection = () => {
    if (!selectedSubmission || !state.currentRound) return;

    const winningSubmission = state.currentRound.submissions.find(
      (s) => s.playerId === selectedSubmission
    );

    if (!winningSubmission) return;

    dispatch({
      type: "SELECT_WINNER",
      payload: { winningSubmission },
    });

    toast({
      title: "Winner Selected!",
      description: "Moving to next round...",
    });
  };

  return (
    <Card className="p-6 mt-4">
      <h3 className="text-xl font-bold mb-4">Card Czar Controls</h3>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full mb-4">
            Judge Submissions ({state.currentRound.submissions.length}{" "}
            submitted)
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select the Winning Submission</DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2">Black Card:</h4>
              <p className="text-lg">{state.currentRound.blackCard.text}</p>
            </div>

            <RadioGroup
              value={selectedSubmission || ""}
              onValueChange={setSelectedSubmission}
              className="space-y-4"
            >
              {state.currentRound.submissions.map((submission, index) => (
                <div
                  key={submission.playerId}
                  className="flex items-start space-x-3"
                >
                  <RadioGroupItem
                    value={submission.playerId}
                    id={`submission-${index}`}
                  />
                  <Label htmlFor={`submission-${index}`} className="text-base">
                    {submission.cards.map((card) => card.text).join(" ")}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <Button
              onClick={handleWinnerSelection}
              disabled={!selectedSubmission}
              className="w-full mt-6"
            >
              Select Winner
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="text-sm text-muted-foreground">
        As Card Czar, your role is to select the winning submission for this
        round.
      </div>
    </Card>
  );
}
