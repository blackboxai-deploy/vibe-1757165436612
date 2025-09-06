'use client';

import React, { useState } from 'react';
import { useCardContext } from '@/context/CardContext';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { CardGrid } from '@/components/cards/CardGrid';
import { CardList } from '@/components/cards/CardList';
import { CardForm } from '@/components/cards/CardForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const { state, getFilteredAndSortedCards } = useCardContext();
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  const filteredCards = getFilteredAndSortedCards();

  if (state.loading) {
    return (
      <div className="flex h-screen">
        <div className="w-80 border-r p-4">
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="h-16 border-b px-4 flex items-center">
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="flex-1 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Content Area */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Stats Bar */}
            <div className="px-6 py-4 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h2 className="text-lg font-semibold">
                    {state.viewMode === 'grid' ? 'Cards' : 'List View'}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {filteredCards.length} of {state.cards.length} cards
                    </Badge>
                    {state.selectedCards.length > 0 && (
                      <Badge variant="secondary">
                        {state.selectedCards.length} selected
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Create Card Button */}
                <Button onClick={() => setIsCreateFormOpen(true)}>
                  Create Card
                </Button>
              </div>

              {/* Active Filters Display */}
              {(state.filters.search || 
                state.filters.categories.length > 0 || 
                state.filters.tags.length > 0 || 
                state.filters.priorities.length > 0 || 
                !state.filters.showCompleted) && (
                <div className="flex items-center space-x-2 mt-3">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  
                  {state.filters.search && (
                    <Badge variant="outline">
                      Search: &quot;{state.filters.search}&quot;
                    </Badge>
                  )}
                  
                  {state.filters.categories.map(categoryId => {
                    const category = state.categories.find(cat => cat.id === categoryId);
                    return category ? (
                      <Badge key={categoryId} variant="outline">
                        {category.name}
                      </Badge>
                    ) : null;
                  })}
                  
                  {state.filters.tags.map(tag => (
                    <Badge key={tag} variant="outline">
                      #{tag}
                    </Badge>
                  ))}
                  
                  {state.filters.priorities.map(priority => (
                    <Badge key={priority} variant="outline">
                      {priority}
                    </Badge>
                  ))}
                  
                  {!state.filters.showCompleted && (
                    <Badge variant="outline">
                      Hide completed
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Cards Display */}
            <ScrollArea className="flex-1">
              <div className="p-6">
                {state.viewMode === 'grid' ? (
                  <CardGrid cards={filteredCards} />
                ) : (
                  <CardList cards={filteredCards} />
                )}
              </div>
            </ScrollArea>
          </div>
        </main>
      </div>

      {/* Create Card Form */}
      <CardForm
        isOpen={isCreateFormOpen}
        onClose={() => setIsCreateFormOpen(false)}
        onSuccess={() => {
          setIsCreateFormOpen(false);
          // You could add some success feedback here
        }}
      />
    </div>
  );
}