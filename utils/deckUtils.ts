import { Card } from "../types/game";

export const initializeDeck = (): Card[] => {
  const blackCards: Card[] = [
    { id: "b1", type: "black", text: "Why can't I sleep at night?", pick: 1 },
    {
      id: "b2",
      type: "black",
      text: "I got 99 problems but _ ain't one.",
      pick: 1,
    },
    // Add more black cards as needed
  ];

  const whiteCards: Card[] = [
    { id: "w1", type: "white", text: "A windmill full of corpses." },
    { id: "w2", type: "white", text: "The Kool-Aid Man." },
    // Add more white cards as needed
  ];

  return [...blackCards, ...whiteCards];
};

export const shuffleDeck = (deck: Card[]) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};
