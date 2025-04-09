"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGame } from "@/app/context/GameContext";
import { Player } from "@/types/game";
import { useEffect, useState } from "react";
import { Confetti } from "@/components/ui/confetti";

export function GameResultsModal() {
  const { state, dispatch } = useGame();
  const [isOpen, setIsOpen] = useState(false);

  // Show modal when game ends
  useEffect(() => {
    if (state.phase === "gameEnd") {
      setIsOpen(true);
    }
  }, [state.phase]);

  // Sort players by score in descending order
  const sortedPlayers = [...state.players].sort(
    (a, b) => (b.score || 0) - (a.score || 0)
  );

  const winner = state.winner || sortedPlayers[0];
  const winMessage =
    state.winCondition.type === "score"
      ? `${winner.name} wins by reaching ${state.winCondition.target} points!`
      : `${winner.name} wins with the highest score after ${state.winCondition.target} rounds!`;

  const handleNewGame = () => {
    setIsOpen(false);
    // Reset game state
    dispatch({ type: "END_GAME", payload: {} });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Game Over!</DialogTitle>
          <DialogDescription>{winner && winMessage}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-4 text-lg font-semibold">Final Scores</h3>
              <div className="space-y-2">
                {sortedPlayers.map((player: Player, index: number) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between"
                  >
                    <span>
                      {index + 1}. {player.name}
                      {player.id === winner.id && " 👑"}
                    </span>
                    <span className="font-semibold">{player.score} points</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button onClick={handleNewGame}>Start New Game</Button>
          </div>
        </div>
      </DialogContent>
      {isOpen && winner && <Confetti />}
    </Dialog>
  );
}
