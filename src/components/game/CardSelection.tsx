import React from "react";
import { Card } from "../../types/game";

interface CardSelectionProps {
  cards: Card[];
  onCardSelect: (card: Card) => void;
}

const CardSelection: React.FC<CardSelectionProps> = ({
  cards,
  onCardSelect,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.id}
          className="p-4 border rounded shadow hover:bg-gray-100 cursor-pointer"
          onClick={() => onCardSelect(card)}
        >
          <p>{card.text}</p>
        </div>
      ))}
    </div>
  );
};

export default CardSelection;
