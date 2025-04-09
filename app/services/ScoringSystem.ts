import { Player } from "@/types/game";

export interface WinCondition {
  type: "score" | "rounds";
  target: number;
}

export class ScoringSystem {
  private winCondition: WinCondition;

  constructor(winCondition: WinCondition) {
    this.winCondition = winCondition;
  }

  /**
   * Check if a player has won based on the current game state
   */
  checkWinCondition(players: Player[], currentRound: number): Player | null {
    switch (this.winCondition.type) {
      case "score":
        // Find player with highest score that meets or exceeds target
        const highestScorer = players.reduce((highest, current) => {
          return (current.score || 0) > (highest?.score || 0)
            ? current
            : highest;
        }, players[0]);

        if ((highestScorer?.score || 0) >= this.winCondition.target) {
          return highestScorer;
        }
        break;

      case "rounds":
        // Check if we've reached the target number of rounds
        if (currentRound >= this.winCondition.target) {
          // Return player with highest score
          return players.reduce((highest, current) => {
            return (current.score || 0) > (highest?.score || 0)
              ? current
              : highest;
          }, players[0]);
        }
        break;
    }

    return null;
  }

  /**
   * Award points to a player
   */
  awardPoints(player: Player, points: number = 1): Player {
    return {
      ...player,
      score: (player.score || 0) + points,
    };
  }

  /**
   * Get current standings
   */
  getStandings(players: Player[]): Player[] {
    return [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
  }
}
