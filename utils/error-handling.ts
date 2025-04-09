// Custom error classes for different types of errors
export class CardError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CardError";
  }
}

export class DeckError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeckError";
  }
}

export class GameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GameError";
  }
}

export class PlayerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlayerError";
  }
}

// Error messages
export enum ErrorMessages {
  // Card errors
  INVALID_CARD = "Invalid card data",
  INVALID_CARD_TYPE = "Invalid card type",
  CARD_NOT_FOUND = "Card not found",

  // Deck errors
  DECK_EMPTY = "Deck is empty",
  INSUFFICIENT_CARDS = "Not enough cards available",
  DISCARD_EMPTY = "No cards in discard pile",

  // Game errors
  GAME_NOT_FOUND = "Game not found",
  INVALID_GAME_STATE = "Invalid game state",
  GAME_ALREADY_EXISTS = "Game already exists",

  // Player errors
  PLAYER_NOT_FOUND = "Player not found",
  INVALID_PLAYER_ACTION = "Invalid player action",
  NOT_PLAYER_TURN = "Not player's turn",
  PLAYER_ALREADY_SUBMITTED = "Player has already submitted cards",

  // New errors
  INSUFFICIENT_PLAYERS = "At least 3 players are required to play the game",
  INVALID_PLAYER_ID = "Invalid player ID provided",
  NO_BLACK_CARD = "No black card has been drawn for this round",
  CARDS_ALREADY_SUBMITTED = "Player has already submitted cards for this round",
  INVALID_CARD_COUNT = "Invalid number of cards submitted",
  INVALID_CARD_INDEX = "Invalid card index provided",
}

// Error handling functions
export function handleCardError(error: unknown): never {
  if (error instanceof CardError) {
    throw error;
  }
  throw new CardError(
    error instanceof Error ? error.message : "Unknown card error"
  );
}

export function handleDeckError(error: unknown): never {
  if (error instanceof DeckError) {
    throw error;
  }
  throw new DeckError(
    error instanceof Error ? error.message : "Unknown deck error"
  );
}

export function handleGameError(error: unknown): never {
  if (error instanceof GameError) {
    throw error;
  }
  throw new GameError(
    error instanceof Error ? error.message : "Unknown game error"
  );
}

export function handlePlayerError(error: unknown): never {
  if (error instanceof PlayerError) {
    throw error;
  }
  throw new PlayerError(
    error instanceof Error ? error.message : "Unknown player error"
  );
}

// Validation functions
export function validateGameId(
  gameId: string | undefined
): asserts gameId is string {
  if (!gameId) {
    throw new GameError(ErrorMessages.GAME_NOT_FOUND);
  }
}

export function validatePlayerId(
  playerId: string | undefined
): asserts playerId is string {
  if (!playerId) {
    throw new PlayerError(ErrorMessages.PLAYER_NOT_FOUND);
  }
}

export function validateCardIds(cardIds: string[]): void {
  if (!cardIds.length) {
    throw new CardError(ErrorMessages.INVALID_CARD);
  }
}

// Type guards
export function isCardError(error: unknown): error is CardError {
  return error instanceof CardError;
}

export function isDeckError(error: unknown): error is DeckError {
  return error instanceof DeckError;
}

export function isGameError(error: unknown): error is GameError {
  return error instanceof GameError;
}

export function isPlayerError(error: unknown): error is PlayerError {
  return error instanceof PlayerError;
}
