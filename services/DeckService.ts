import { Card } from "@/types/game";
import { allCards, blackCards, whiteCards } from "@/data/cards";
import {
  DeckError,
  ErrorMessages,
  validateCard,
  validateDeckState,
  handleDeckError,
} from "@/utils/error-handling";

export class DeckService {
  private blackDeck: Card[];
  private whiteDeck: Card[];
  private blackDiscard: Card[];
  private whiteDiscard: Card[];
  private readonly maxDeckSize = 1000;

  constructor() {
    try {
      // Validate all cards before initializing
      allCards.forEach(validateCard);

      // Initialize decks with shuffled cards
      this.blackDeck = [...blackCards].sort(() => Math.random() - 0.5);
      this.whiteDeck = [...whiteCards].sort(() => Math.random() - 0.5);
      this.blackDiscard = [];
      this.whiteDiscard = [];

      // Validate initial deck state
      this.validateDeckStates();
    } catch (error) {
      handleDeckError(error, { blackCards, whiteCards });
    }
  }

  /**
   * Draw a black card from the deck
   */
  drawBlackCard(): Card {
    try {
      if (this.blackDeck.length === 0) {
        if (this.blackDiscard.length === 0) {
          throw new DeckError(ErrorMessages.DECK_EMPTY);
        }
        this.reshuffleBlackDeck();
      }

      const card = this.blackDeck.pop();
      if (!card) {
        throw new DeckError(ErrorMessages.DECK_EMPTY);
      }

      validateCard(card);
      return card;
    } catch (error) {
      handleDeckError(error, {
        blackDeckSize: this.blackDeck.length,
        blackDiscardSize: this.blackDiscard.length,
      });
    }
  }

  /**
   * Draw multiple white cards from the deck
   */
  drawWhiteCards(count: number): Card[] {
    try {
      if (count <= 0) {
        throw new DeckError("Invalid card count requested");
      }

      if (count > this.maxDeckSize) {
        throw new DeckError(ErrorMessages.DECK_OVERFLOW);
      }

      const totalAvailableCards =
        this.whiteDeck.length + this.whiteDiscard.length;
      if (totalAvailableCards < count) {
        throw new DeckError(ErrorMessages.INSUFFICIENT_CARDS);
      }

      const cards: Card[] = [];
      for (let i = 0; i < count; i++) {
        if (this.whiteDeck.length === 0) {
          if (this.whiteDiscard.length === 0) {
            throw new DeckError(ErrorMessages.INSUFFICIENT_CARDS);
          }
          this.reshuffleWhiteDeck();
        }

        const card = this.whiteDeck.pop();
        if (!card) {
          throw new DeckError(ErrorMessages.INSUFFICIENT_CARDS);
        }

        validateCard(card);
        cards.push(card);
      }

      return cards;
    } catch (error) {
      handleDeckError(error, {
        requestedCount: count,
        whiteDeckSize: this.whiteDeck.length,
        whiteDiscardSize: this.whiteDiscard.length,
      });
    }
  }

  /**
   * Discard a black card
   */
  discardBlackCard(card: Card) {
    try {
      validateCard(card);

      if (card.type !== "black") {
        throw new DeckError(ErrorMessages.INVALID_CARD_TYPE);
      }

      if (this.blackDiscard.length >= this.maxDeckSize) {
        throw new DeckError(ErrorMessages.DECK_OVERFLOW);
      }

      this.blackDiscard.push(card);
    } catch (error) {
      handleDeckError(error, {
        card,
        blackDiscardSize: this.blackDiscard.length,
      });
    }
  }

  /**
   * Discard multiple white cards
   */
  discardWhiteCards(cards: Card[]) {
    try {
      if (!Array.isArray(cards)) {
        throw new DeckError("Invalid cards array");
      }

      if (this.whiteDiscard.length + cards.length > this.maxDeckSize) {
        throw new DeckError(ErrorMessages.DECK_OVERFLOW);
      }

      for (const card of cards) {
        validateCard(card);
        if (card.type !== "white") {
          throw new DeckError(ErrorMessages.INVALID_CARD_TYPE);
        }
      }

      this.whiteDiscard.push(...cards);
    } catch (error) {
      handleDeckError(error, {
        cards,
        whiteDiscardSize: this.whiteDiscard.length,
      });
    }
  }

  /**
   * Reset all decks to their initial state
   */
  resetDecks() {
    try {
      this.blackDeck = [...blackCards].sort(() => Math.random() - 0.5);
      this.whiteDeck = [...whiteCards].sort(() => Math.random() - 0.5);
      this.blackDiscard = [];
      this.whiteDiscard = [];

      this.validateDeckStates();
    } catch (error) {
      handleDeckError(error, { blackCards, whiteCards });
    }
  }

  /**
   * Reshuffle the black deck with discarded cards
   */
  private reshuffleBlackDeck() {
    try {
      if (this.blackDiscard.length === 0) {
        throw new DeckError(ErrorMessages.DISCARD_EMPTY);
      }

      if (this.blackDiscard.length > this.maxDeckSize) {
        throw new DeckError(ErrorMessages.DECK_OVERFLOW);
      }

      this.blackDeck = [...this.blackDiscard].sort(() => Math.random() - 0.5);
      this.blackDiscard = [];

      this.validateDeckStates();
    } catch (error) {
      handleDeckError(error, { blackDiscardSize: this.blackDiscard.length });
    }
  }

  /**
   * Reshuffle the white deck with discarded cards
   */
  private reshuffleWhiteDeck() {
    try {
      if (this.whiteDiscard.length === 0) {
        throw new DeckError(ErrorMessages.DISCARD_EMPTY);
      }

      if (this.whiteDiscard.length > this.maxDeckSize) {
        throw new DeckError(ErrorMessages.DECK_OVERFLOW);
      }

      this.whiteDeck = [...this.whiteDiscard].sort(() => Math.random() - 0.5);
      this.whiteDiscard = [];

      this.validateDeckStates();
    } catch (error) {
      handleDeckError(error, { whiteDiscardSize: this.whiteDiscard.length });
    }
  }

  /**
   * Validate the state of both decks
   */
  private validateDeckStates() {
    validateDeckState({ cards: this.blackDeck });
    validateDeckState({ cards: this.whiteDeck });
    validateDeckState({ cards: this.blackDiscard });
    validateDeckState({ cards: this.whiteDiscard });
  }

  /**
   * Get deck statistics
   */
  getDeckStats() {
    return {
      blackDeck: {
        remaining: this.blackDeck.length,
        discarded: this.blackDiscard.length,
        total: blackCards.length,
      },
      whiteDeck: {
        remaining: this.whiteDeck.length,
        discarded: this.whiteDiscard.length,
        total: whiteCards.length,
      },
    };
  }
}
