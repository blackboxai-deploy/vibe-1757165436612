'use client';

import React from 'react';
import { Card } from '@/lib/types';
import { useCardContext } from '@/context/CardContext';
import { CardItem } from './CardItem';

interface CardGridProps {
  cards: Card[];
}

export function CardGrid({ cards }: CardGridProps) {
  const { state, dispatch } = useCardContext();

  const handleToggleSelect = (cardId: string) => {
    dispatch({ type: 'TOGGLE_CARD_SELECTION', payload: cardId });
  };

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-3xl text-muted-foreground">📝</span>
        </div>
        <h3 className="text-lg font-semibold mb-2">No cards found</h3>
        <p className="text-muted-foreground mb-4 max-w-sm">
          {state.filters.search || state.filters.categories.length > 0 || state.filters.tags.length > 0
            ? 'Try adjusting your filters or search terms to find more cards.'
            : 'Get started by creating your first card to organize your tasks and ideas.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {cards.map(card => (
        <CardItem
          key={card.id}
          card={card}
          isSelected={state.selectedCards.includes(card.id)}
          onToggleSelect={handleToggleSelect}
          viewMode="grid"
        />
      ))}
    </div>
  );
}