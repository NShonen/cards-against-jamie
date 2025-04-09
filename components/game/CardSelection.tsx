"use client";

import React from "react";
import { Card as GameCard } from "../../types/game";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CardSelectionProps {
  cards: GameCard[];
  onCardSelect: (card: GameCard) => void;
  disabled?: boolean;
}

const CardSelection: React.FC<CardSelectionProps> = ({
  cards,
  onCardSelect,
  disabled = false,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card
          key={card.id}
          className={cn(
            "transition-colors",
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-accent cursor-pointer"
          )}
          onClick={() => !disabled && onCardSelect(card)}
        >
          <CardContent className="p-4">
            <p>{card.text}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CardSelection;
