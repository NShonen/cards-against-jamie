import { GameCardManager } from "../services/GameCardManager";
import { Card, Player } from "../types/game";
import { ErrorMessages } from "../utils/error-handling";

describe("GameCardManager", () => {
  let manager: GameCardManager;
  let players: Player[];

  beforeEach(() => {
    manager = new GameCardManager();
    players = [
      { id: "1", name: "Player 1", score: 0, cards: [] },
      { id: "2", name: "Player 2", score: 0, cards: [] },
      { id: "3", name: "Player 3", score: 0, cards: [] },
    ];
    manager.initializeGame(players);
  });

  describe("initializeGame", () => {
    it("should initialize game with players", () => {
      const initializedPlayers = manager.getPlayers();
      expect(initializedPlayers).toHaveLength(3);
      initializedPlayers.forEach((player) => {
        expect(player.cards).toHaveLength(7);
      });
    });

    it("should throw error if insufficient players", () => {
      expect(() => {
        manager.initializeGame([players[0]]);
      }).toThrow(ErrorMessages.INSUFFICIENT_PLAYERS);
    });
  });

  describe("drawBlackCard", () => {
    it("should draw a black card", () => {
      const card = manager.drawBlackCard();
      expect(card.type).toBe("black");
      expect(manager.getCurrentBlackCard()).toEqual(card);
    });
  });

  describe("submitCards", () => {
    let blackCard: Card;

    beforeEach(() => {
      blackCard = manager.drawBlackCard();
    });

    it("should allow player to submit cards", () => {
      const playerId = "1";
      const playerCards = manager.getPlayerCards(playerId);
      manager.submitCards(playerId, [0, 1]);

      const submissions = manager.getSubmittedCards();
      expect(submissions.get(playerId)).toHaveLength(2);
      expect(manager.getPlayerCards(playerId)).toHaveLength(7);
    });

    it("should throw error if player submits twice", () => {
      const playerId = "1";
      manager.submitCards(playerId, [0, 1]);
      expect(() => {
        manager.submitCards(playerId, [0, 1]);
      }).toThrow(ErrorMessages.CARDS_ALREADY_SUBMITTED);
    });
  });

  describe("handlePlayerLeave", () => {
    it("should remove player from game", () => {
      manager.handlePlayerLeave("1");
      expect(manager.getPlayers()).toHaveLength(2);
    });

    it("should throw error if insufficient players remain", () => {
      manager.handlePlayerLeave("1");
      expect(() => {
        manager.handlePlayerLeave("2");
      }).toThrow(ErrorMessages.INSUFFICIENT_PLAYERS);
    });
  });
});
