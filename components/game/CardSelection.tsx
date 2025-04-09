"use client";

import React, { useState } from "react";
import { Card as GameCard } from "../../types/game";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CardSelectionProps {
  cards: GameCard[];
  onCardSelect: (cards: GameCard[]) => void;
  disabled?: boolean;
  maxSelections?: number;
  blackCard?: GameCard | null;
}

const CardSelection: React.FC<CardSelectionProps> = ({
  cards,
  onCardSelect,
  disabled = false,
  maxSelections = 1,
  blackCard,
}) => {
  const [selectedCards, setSelectedCards] = useState<GameCard[]>([]);

  const handleCardClick = (card: GameCard) => {
    if (disabled) return;

    setSelectedCards((prev) => {
      const isSelected = prev.some((c) => c.id === card.id);
      if (isSelected) {
        return prev.filter((c) => c.id !== card.id);
      }
      if (prev.length >= maxSelections) {
        return [...prev.slice(1), card];
      }
      return [...prev, card];
    });
  };

  const handleSubmit = () => {
    if (selectedCards.length === maxSelections) {
      onCardSelect(selectedCards);
      setSelectedCards([]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const isSelected = selectedCards.some((c) => c.id === card.id);
          return (
            <TooltipProvider key={card.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={cn(
                        "transition-colors relative cursor-pointer min-h-[150px]",
                        disabled
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-accent",
                        isSelected && "ring-2 ring-primary shadow-lg"
                      )}
                      onClick={() => !disabled && handleCardClick(card)}
                    >
                      <CardContent className="p-4">
                        <p className="text-base">{card.text}</p>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center">
                            {selectedCards.findIndex((c) => c.id === card.id) +
                              1}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to {isSelected ? "deselect" : "select"} this card</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {!disabled && blackCard && (
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-muted-foreground">
            Select {maxSelections} card{maxSelections > 1 ? "s" : ""} to answer:
            <span className="font-medium ml-2">{blackCard.text}</span>
          </p>
          <Button
            onClick={handleSubmit}
            disabled={selectedCards.length !== maxSelections}
            className="ml-4"
          >
            Submit {selectedCards.length}/{maxSelections}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CardSelection;
