import { blackCards } from "./black-cards";
import { whiteCards } from "./white-cards";
import {
  validateCard,
  validateCardSet,
  validateDeckSize,
  getCardSetStats,
} from "@/utils/card-validation";
import { Card } from "@/types/game";

// Combine all cards
export const allCards = [...blackCards, ...whiteCards];

// Validate cards on import
if (!validateCardSet(allCards)) {
  throw new Error(
    "Invalid card set detected. Check for duplicate IDs or invalid card data."
  );
}

// Get card stats
export const cardStats = getCardSetStats(allCards);

// Validate deck sizes
if (!validateDeckSize(allCards, "black")) {
  throw new Error("Not enough black cards in deck. Minimum required: 20");
}

if (!validateDeckSize(allCards, "white")) {
  throw new Error("Not enough white cards in deck. Minimum required: 100");
}

// Export individual decks
export { blackCards, whiteCards };

// Export validation utilities
export { validateCard, validateCardSet, validateDeckSize, getCardSetStats };

// Helper functions
export function getCardsByCategory(cards: Card[], category: string): Card[] {
  return cards.filter((card) => card.category === category);
}

export function getRandomCard(cards: Card[]): Card {
  return cards[Math.floor(Math.random() * cards.length)];
}

export function getRandomCards(cards: Card[], count: number): Card[] {
  const shuffled = [...cards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getCategories(): string[] {
  return cardStats.categories;
}

export function getPickCountStats(): typeof cardStats.pickCounts {
  return cardStats.pickCounts;
}
