import { Card } from "@/types/game";

/**
 * Validates a card's basic structure and required fields
 */
export function validateCard(card: Card): boolean {
  if (!card.id || typeof card.id !== "string") return false;
  if (!card.text || typeof card.text !== "string") return false;
  if (card.type !== "black" && card.type !== "white") return false;

  // Black cards must have a pick count
  if (
    card.type === "black" &&
    (typeof card.pick !== "number" || card.pick < 1)
  ) {
    return false;
  }

  return true;
}

/**
 * Validates an array of cards for uniqueness and consistency
 */
export function validateCardSet(cards: Card[]): boolean {
  const ids = new Set<string>();

  for (const card of cards) {
    // Check basic card validity
    if (!validateCard(card)) return false;

    // Check for duplicate IDs
    if (ids.has(card.id)) return false;
    ids.add(card.id);
  }

  return true;
}

/**
 * Validates that a set of cards contains enough cards for a game
 */
export function validateDeckSize(
  cards: Card[],
  type: "black" | "white"
): boolean {
  const minBlackCards = 20;
  const minWhiteCards = 100;

  const typeCards = cards.filter((card) => card.type === type);
  return type === "black"
    ? typeCards.length >= minBlackCards
    : typeCards.length >= minWhiteCards;
}

/**
 * Gets statistics about a card set
 */
export function getCardSetStats(cards: Card[]) {
  const stats = {
    total: cards.length,
    blackCards: 0,
    whiteCards: 0,
    categories: new Set<string>(),
    averagePickCount: 0,
    pickCounts: {
      1: 0,
      2: 0,
      3: 0,
    },
  };

  let totalPickCount = 0;
  let blackCardCount = 0;

  for (const card of cards) {
    if (card.type === "black") {
      stats.blackCards++;
      blackCardCount++;
      if (card.pick) {
        totalPickCount += card.pick;
        stats.pickCounts[card.pick as keyof typeof stats.pickCounts]++;
      }
    } else {
      stats.whiteCards++;
    }
    if (card.category) {
      stats.categories.add(card.category);
    }
  }

  stats.averagePickCount =
    blackCardCount > 0 ? totalPickCount / blackCardCount : 0;

  return {
    ...stats,
    categories: Array.from(stats.categories),
  };
}
