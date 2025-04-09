import { GameCardManager } from "@/services/GameCardManager";
import { Card, Player } from "@/types/game";

describe("GameCardManager", () => {
  let gameCardManager: GameCardManager;
  const gameId = "test-game";
  const players: Player[] = [
    { id: "p1", name: "Player 1", hand: [], isCardCzar: false, score: 0 },
    { id: "p2", name: "Player 2", hand: [], isCardCzar: false, score: 0 },
  ];

  beforeEach(() => {
    gameCardManager = new GameCardManager();
  });

  describe("initializeGame", () => {
    it("should deal 10 cards to each player", () => {
      gameCardManager.initializeGame(gameId, players);

      for (const player of players) {
        const hand = gameCardManager.getPlayerHand(player.id);
        expect(hand.length).toBe(10);
        expect(hand.every((card) => card.type === "white")).toBe(true);
      }
    });
  });

  describe("drawBlackCard", () => {
    it("should draw a black card", () => {
      const card = gameCardManager.drawBlackCard();
      expect(card.type).toBe("black");
    });
  });

  describe("submitCards", () => {
    beforeEach(() => {
      gameCardManager.initializeGame(gameId, players);
    });

    it("should submit cards and draw replacements", () => {
      const initialHand = gameCardManager.getPlayerHand(players[0].id);
      const cardsToSubmit = [initialHand[0].id, initialHand[1].id];

      const submission = gameCardManager.submitCards(
        gameId,
        players[0].id,
        cardsToSubmit
      );

      // Check submission
      expect(submission.playerId).toBe(players[0].id);
      expect(submission.cards.length).toBe(2);
      expect(submission.cards.map((c) => c.id)).toEqual(cardsToSubmit);

      // Check hand was replenished
      const newHand = gameCardManager.getPlayerHand(players[0].id);
      expect(newHand.length).toBe(10);
      expect(newHand.map((c) => c.id)).not.toContain(cardsToSubmit[0]);
      expect(newHand.map((c) => c.id)).not.toContain(cardsToSubmit[1]);
    });

    it("should throw error for invalid card IDs", () => {
      expect(() => {
        gameCardManager.submitCards(gameId, players[0].id, ["invalid-id"]);
      }).toThrow();
    });
  });

  describe("getSubmittedCards", () => {
    beforeEach(() => {
      gameCardManager.initializeGame(gameId, players);
    });

    it("should return all submitted cards for a game", () => {
      // Submit cards from both players
      const hand1 = gameCardManager.getPlayerHand(players[0].id);
      const hand2 = gameCardManager.getPlayerHand(players[1].id);

      gameCardManager.submitCards(gameId, players[0].id, [hand1[0].id]);
      gameCardManager.submitCards(gameId, players[1].id, [hand2[0].id]);

      const submissions = gameCardManager.getSubmittedCards(gameId);
      expect(submissions.length).toBe(2);
      expect(submissions[0].playerId).toBe(players[0].id);
      expect(submissions[1].playerId).toBe(players[1].id);
    });
  });

  describe("handlePlayerLeave", () => {
    beforeEach(() => {
      gameCardManager.initializeGame(gameId, players);
    });

    it("should clean up player state when they leave", () => {
      // Submit some cards first
      const hand = gameCardManager.getPlayerHand(players[0].id);
      gameCardManager.submitCards(gameId, players[0].id, [hand[0].id]);

      // Handle player leaving
      gameCardManager.handlePlayerLeave(gameId, players[0].id);

      // Check their submissions were removed
      const submissions = gameCardManager.getSubmittedCards(gameId);
      expect(submissions.length).toBe(0);

      // Check their hand was discarded
      expect(() => {
        gameCardManager.getPlayerHand(players[0].id);
      }).toThrow();
    });
  });

  describe("resetGame", () => {
    beforeEach(() => {
      gameCardManager.initializeGame(gameId, players);
    });

    it("should reset game state", () => {
      // Submit some cards
      const hand = gameCardManager.getPlayerHand(players[0].id);
      gameCardManager.submitCards(gameId, players[0].id, [hand[0].id]);

      // Reset game
      gameCardManager.resetGame(gameId);

      // Check submissions were cleared
      const submissions = gameCardManager.getSubmittedCards(gameId);
      expect(submissions.length).toBe(0);

      // Check deck stats were reset
      const stats = gameCardManager.getDeckStats();
      expect(stats.blackDeck.discarded).toBe(0);
      expect(stats.whiteDeck.discarded).toBe(0);
    });
  });
});
