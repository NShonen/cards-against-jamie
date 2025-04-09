import { Card, Player } from "@/types/game";
import { DeckService } from "./DeckService";
import { GameError, PlayerError, ErrorMessages } from "@/utils/error-handling";

export class GameCardManager {
  private deckService: DeckService;
  private players: Map<string, Player>;
  private submittedCards: Map<string, Card[]>;
  private currentBlackCard: Card | null;

  constructor() {
    this.deckService = new DeckService();
    this.players = new Map();
    this.submittedCards = new Map();
    this.currentBlackCard = null;
  }

  /**
   * Initialize a new game with the given players
   */
  initializeGame(players: Player[]) {
    if (players.length < 3) {
      throw new GameError(ErrorMessages.INSUFFICIENT_PLAYERS);
    }

    // Reset state
    this.deckService.resetDecks();
    this.players.clear();
    this.submittedCards.clear();
    this.currentBlackCard = null;

    // Initialize players with cards
    for (const player of players) {
      if (!player.id) {
        throw new PlayerError(ErrorMessages.INVALID_PLAYER_ID);
      }
      this.players.set(player.id, {
        ...player,
        hand: this.deckService.drawWhiteCards(7),
      });
    }
  }

  /**
   * Draw a new black card for the round
   */
  drawBlackCard(): Card {
    if (this.players.size < 3) {
      throw new GameError(ErrorMessages.INSUFFICIENT_PLAYERS);
    }

    if (this.currentBlackCard) {
      this.deckService.discardBlackCard(this.currentBlackCard);
    }

    this.currentBlackCard = this.deckService.drawBlackCard();
    this.submittedCards.clear();
    return this.currentBlackCard;
  }

  /**
   * Submit cards for a player
   */
  submitCards(playerId: string, cardIndices: number[]) {
    const player = this.players.get(playerId);
    if (!player) {
      throw new PlayerError(ErrorMessages.PLAYER_NOT_FOUND);
    }

    if (!this.currentBlackCard) {
      throw new GameError(ErrorMessages.NO_BLACK_CARD);
    }

    if (this.submittedCards.has(playerId)) {
      throw new GameError(ErrorMessages.CARDS_ALREADY_SUBMITTED);
    }

    if (cardIndices.length !== this.currentBlackCard.pick) {
      throw new GameError(ErrorMessages.INVALID_CARD_COUNT);
    }

    // Validate and collect cards to submit
    const submittedCards: Card[] = [];
    const newCards: Card[] = [];
    const remainingCards: Card[] = [...player.hand];

    for (const index of cardIndices.sort((a, b) => b - a)) {
      if (index < 0 || index >= remainingCards.length) {
        throw new GameError(ErrorMessages.INVALID_CARD_INDEX);
      }
      submittedCards.push(remainingCards[index]);
      remainingCards.splice(index, 1);
    }

    // Draw new cards and update player's hand
    try {
      newCards.push(...this.deckService.drawWhiteCards(cardIndices.length));
    } catch (error) {
      // If we can't draw new cards, return the submitted cards to the player
      remainingCards.push(...submittedCards);
      throw error;
    }

    // Update player's cards and store submission
    this.players.set(playerId, {
      ...player,
      hand: [...remainingCards, ...newCards],
    });
    this.submittedCards.set(playerId, submittedCards);

    // Discard submitted cards
    this.deckService.discardWhiteCards(submittedCards);
  }

  /**
   * Get all submitted cards for the current round
   */
  getSubmittedCards(): Map<string, Card[]> {
    if (!this.currentBlackCard) {
      throw new GameError(ErrorMessages.NO_BLACK_CARD);
    }
    return new Map(this.submittedCards);
  }

  /**
   * Handle a player leaving the game
   */
  handlePlayerLeave(playerId: string) {
    const player = this.players.get(playerId);
    if (!player) {
      throw new PlayerError(ErrorMessages.PLAYER_NOT_FOUND);
    }

    // Discard player's cards
    this.deckService.discardWhiteCards(player.hand);

    // Remove player data
    this.players.delete(playerId);
    this.submittedCards.delete(playerId);

    // If not enough players remain, throw error
    if (this.players.size < 3) {
      throw new GameError(ErrorMessages.INSUFFICIENT_PLAYERS);
    }
  }

  /**
   * Reset the game state
   */
  resetGame() {
    this.deckService.resetDecks();
    this.players.clear();
    this.submittedCards.clear();
    this.currentBlackCard = null;
  }

  /**
   * Get a player's current cards
   */
  getPlayerCards(playerId: string): Card[] {
    const player = this.players.get(playerId);
    if (!player) {
      throw new PlayerError(ErrorMessages.PLAYER_NOT_FOUND);
    }
    return [...player.hand];
  }

  /**
   * Get the current black card
   */
  getCurrentBlackCard(): Card | null {
    return this.currentBlackCard;
  }

  /**
   * Get all players in the game
   */
  getPlayers(): Player[] {
    return Array.from(this.players.values());
  }
}
