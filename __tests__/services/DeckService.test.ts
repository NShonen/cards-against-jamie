import { DeckService } from "@/services/DeckService";
import { Card } from "@/types/game";
import { blackCards, whiteCards } from "@/data/cards";

describe("DeckService", () => {
  let deckService: DeckService;

  beforeEach(() => {
    deckService = new DeckService();
  });

  describe("initialization", () => {
    it("should initialize with correct deck sizes", () => {
      const stats = deckService.getDeckStats();
      expect(stats.blackDeck.remaining).toBe(blackCards.length);
      expect(stats.whiteDeck.remaining).toBe(whiteCards.length);
      expect(stats.blackDeck.discarded).toBe(0);
      expect(stats.whiteDeck.discarded).toBe(0);
    });
  });

  describe("drawBlackCard", () => {
    it("should draw a black card from the deck", () => {
      const card = deckService.drawBlackCard();
      expect(card.type).toBe("black");

      const stats = deckService.getDeckStats();
      expect(stats.blackDeck.remaining).toBe(blackCards.length - 1);
    });

    it("should reshuffle when deck is empty", () => {
      // Draw all cards
      for (let i = 0; i < blackCards.length; i++) {
        const card = deckService.drawBlackCard();
        deckService.discardBlackCard(card);
      }

      // Should be able to draw again after reshuffle
      const card = deckService.drawBlackCard();
      expect(card.type).toBe("black");
    });
  });

  describe("drawWhiteCards", () => {
    it("should draw multiple white cards", () => {
      const count = 5;
      const cards = deckService.drawWhiteCards(count);

      expect(cards.length).toBe(count);
      cards.forEach((card) => expect(card.type).toBe("white"));

      const stats = deckService.getDeckStats();
      expect(stats.whiteDeck.remaining).toBe(whiteCards.length - count);
    });

    it("should reshuffle when needed", () => {
      // Draw all cards
      const firstDraw = deckService.drawWhiteCards(whiteCards.length);
      deckService.discardWhiteCards(firstDraw);

      // Should be able to draw again after reshuffle
      const secondDraw = deckService.drawWhiteCards(5);
      expect(secondDraw.length).toBe(5);
    });
  });

  describe("discardCards", () => {
    it("should correctly discard black cards", () => {
      const card = deckService.drawBlackCard();
      deckService.discardBlackCard(card);

      const stats = deckService.getDeckStats();
      expect(stats.blackDeck.discarded).toBe(1);
    });

    it("should correctly discard white cards", () => {
      const cards = deckService.drawWhiteCards(3);
      deckService.discardWhiteCards(cards);

      const stats = deckService.getDeckStats();
      expect(stats.whiteDeck.discarded).toBe(3);
    });

    it("should throw error when discarding wrong card type", () => {
      const whiteCard: Card = {
        id: "test",
        type: "white",
        text: "test",
      };

      expect(() => deckService.discardBlackCard(whiteCard)).toThrow();
    });
  });

  describe("resetDecks", () => {
    it("should reset decks to initial state", () => {
      // Draw and discard some cards
      const blackCard = deckService.drawBlackCard();
      const whiteCards = deckService.drawWhiteCards(5);

      deckService.discardBlackCard(blackCard);
      deckService.discardWhiteCards(whiteCards);

      // Reset decks
      deckService.resetDecks();

      // Check stats
      const stats = deckService.getDeckStats();
      expect(stats.blackDeck.remaining).toBe(blackCards.length);
      expect(stats.whiteDeck.remaining).toBe(whiteCards.length);
      expect(stats.blackDeck.discarded).toBe(0);
      expect(stats.whiteDeck.discarded).toBe(0);
    });
  });
});
