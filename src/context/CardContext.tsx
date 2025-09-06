'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Card, Category, FilterOptions, SortOptions, ViewMode } from '@/lib/types';
import { cardStorage, categoryStorage } from '@/lib/storage';

// Action types
type CardAction =
  | { type: 'SET_CARDS'; payload: Card[] }
  | { type: 'ADD_CARD'; payload: Card }
  | { type: 'UPDATE_CARD'; payload: { id: string; updates: Partial<Card> } }
  | { type: 'DELETE_CARD'; payload: string }
  | { type: 'DELETE_CARDS'; payload: string[] }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: { id: string; updates: Partial<Category> } }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<FilterOptions> }
  | { type: 'SET_SORT'; payload: SortOptions }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SET_SELECTED_CARDS'; payload: string[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_CARD_SELECTION'; payload: string }
  | { type: 'CLEAR_SELECTION' };

// State interface
interface CardState {
  cards: Card[];
  categories: Category[];
  filters: FilterOptions;
  sort: SortOptions;
  viewMode: ViewMode;
  selectedCards: string[];
  loading: boolean;
  uniqueTags: string[];
}

// Initial state
const initialState: CardState = {
  cards: [],
  categories: [],
  filters: {
    search: '',
    categories: [],
    tags: [],
    priorities: [],
    showCompleted: true,
    dueDateRange: {
      from: null,
      to: null,
    },
  },
  sort: {
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  },
  viewMode: 'grid',
  selectedCards: [],
  loading: true,
  uniqueTags: [],
};

// Reducer function
function cardReducer(state: CardState, action: CardAction): CardState {
  switch (action.type) {
    case 'SET_CARDS':
      return {
        ...state,
        cards: action.payload,
        uniqueTags: getUniqueTagsFromCards(action.payload),
      };

    case 'ADD_CARD':
      const newCards = [...state.cards, action.payload];
      return {
        ...state,
        cards: newCards,
        uniqueTags: getUniqueTagsFromCards(newCards),
      };

    case 'UPDATE_CARD':
      const updatedCards = state.cards.map(card =>
        card.id === action.payload.id
          ? { ...card, ...action.payload.updates, updatedAt: new Date() }
          : card
      );
      return {
        ...state,
        cards: updatedCards,
        uniqueTags: getUniqueTagsFromCards(updatedCards),
      };

    case 'DELETE_CARD':
      const filteredCards = state.cards.filter(card => card.id !== action.payload);
      return {
        ...state,
        cards: filteredCards,
        selectedCards: state.selectedCards.filter(id => id !== action.payload),
        uniqueTags: getUniqueTagsFromCards(filteredCards),
      };

    case 'DELETE_CARDS':
      const remainingCards = state.cards.filter(card => !action.payload.includes(card.id));
      return {
        ...state,
        cards: remainingCards,
        selectedCards: [],
        uniqueTags: getUniqueTagsFromCards(remainingCards),
      };

    case 'SET_CATEGORIES':
      return {
        ...state,
        categories: action.payload,
      };

    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, action.payload],
      };

    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(category =>
          category.id === action.payload.id
            ? { ...category, ...action.payload.updates }
            : category
        ),
      };

    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(category => category.id !== action.payload),
      };

    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };

    case 'SET_SORT':
      return {
        ...state,
        sort: action.payload,
      };

    case 'SET_VIEW_MODE':
      return {
        ...state,
        viewMode: action.payload,
      };

    case 'SET_SELECTED_CARDS':
      return {
        ...state,
        selectedCards: action.payload,
      };

    case 'TOGGLE_CARD_SELECTION':
      const isSelected = state.selectedCards.includes(action.payload);
      return {
        ...state,
        selectedCards: isSelected
          ? state.selectedCards.filter(id => id !== action.payload)
          : [...state.selectedCards, action.payload],
      };

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedCards: [],
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    default:
      return state;
  }
}

// Context interface
interface CardContextType {
  state: CardState;
  dispatch: React.Dispatch<CardAction>;
  // Card actions
  addCard: (card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Card>;
  updateCard: (id: string, updates: Partial<Card>) => Promise<Card | null>;
  deleteCard: (id: string) => Promise<boolean>;
  deleteSelectedCards: () => Promise<number>;
  // Category actions
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<Category | null>;
  deleteCategory: (id: string) => Promise<boolean>;
  // Utility functions
  getFilteredAndSortedCards: () => Card[];
  refreshData: () => Promise<void>;
}

// Create context
const CardContext = createContext<CardContextType | undefined>(undefined);

// Helper function to get unique tags from cards
function getUniqueTagsFromCards(cards: Card[]): string[] {
  const tagSet = new Set<string>();
  cards.forEach(card => {
    card.tags.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

// Provider component
export function CardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cardReducer, initialState);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        const cards = cardStorage.getCards();
        const categories = categoryStorage.getCategories();
        
        dispatch({ type: 'SET_CARDS', payload: cards });
        dispatch({ type: 'SET_CATEGORIES', payload: categories });
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadData();
  }, []);

  // Card actions
  const addCard = async (cardData: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<Card> => {
    const newCard = cardStorage.addCard(cardData);
    dispatch({ type: 'ADD_CARD', payload: newCard });
    return newCard;
  };

  const updateCard = async (id: string, updates: Partial<Card>): Promise<Card | null> => {
    const updatedCard = cardStorage.updateCard(id, updates);
    if (updatedCard) {
      dispatch({ type: 'UPDATE_CARD', payload: { id, updates } });
    }
    return updatedCard;
  };

  const deleteCard = async (id: string): Promise<boolean> => {
    const success = cardStorage.deleteCard(id);
    if (success) {
      dispatch({ type: 'DELETE_CARD', payload: id });
    }
    return success;
  };

  const deleteSelectedCards = async (): Promise<number> => {
    const deletedCount = cardStorage.deleteCards(state.selectedCards);
    if (deletedCount > 0) {
      dispatch({ type: 'DELETE_CARDS', payload: state.selectedCards });
    }
    return deletedCount;
  };

  // Category actions
  const addCategory = async (categoryData: Omit<Category, 'id' | 'createdAt'>): Promise<Category> => {
    const newCategory = categoryStorage.addCategory(categoryData);
    dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
    return newCategory;
  };

  const updateCategory = async (id: string, updates: Partial<Category>): Promise<Category | null> => {
    const updatedCategory = categoryStorage.updateCategory(id, updates);
    if (updatedCategory) {
      dispatch({ type: 'UPDATE_CATEGORY', payload: { id, updates } });
    }
    return updatedCategory;
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    const success = categoryStorage.deleteCategory(id);
    if (success) {
      dispatch({ type: 'DELETE_CATEGORY', payload: id });
    }
    return success;
  };

  // Utility functions
  const getFilteredAndSortedCards = (): Card[] => {
    let filteredCards = [...state.cards];

    // Apply search filter
    if (state.filters.search) {
      const searchTerm = state.filters.search.toLowerCase();
      filteredCards = filteredCards.filter(card =>
        card.title.toLowerCase().includes(searchTerm) ||
        card.description.toLowerCase().includes(searchTerm) ||
        card.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Apply category filter
    if (state.filters.categories.length > 0) {
      filteredCards = filteredCards.filter(card =>
        state.filters.categories.includes(card.category)
      );
    }

    // Apply tag filter
    if (state.filters.tags.length > 0) {
      filteredCards = filteredCards.filter(card =>
        state.filters.tags.some(tag => card.tags.includes(tag))
      );
    }

    // Apply priority filter
    if (state.filters.priorities.length > 0) {
      filteredCards = filteredCards.filter(card =>
        state.filters.priorities.includes(card.priority)
      );
    }

    // Apply completed filter
    if (!state.filters.showCompleted) {
      filteredCards = filteredCards.filter(card => !card.completed);
    }

    // Apply due date filter
    if (state.filters.dueDateRange.from || state.filters.dueDateRange.to) {
      filteredCards = filteredCards.filter(card => {
        if (!card.dueDate) return false;
        
        const dueDate = new Date(card.dueDate);
        const fromDate = state.filters.dueDateRange.from;
        const toDate = state.filters.dueDateRange.to;
        
        if (fromDate && dueDate < fromDate) return false;
        if (toDate && dueDate > toDate) return false;
        
        return true;
      });
    }

    // Apply sorting
    filteredCards.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (state.sort.sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'priority':
          const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
        default:
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
      }

      if (state.sort.sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return filteredCards;
  };

  const refreshData = async (): Promise<void> => {
    const cards = cardStorage.getCards();
    const categories = categoryStorage.getCategories();
    
    dispatch({ type: 'SET_CARDS', payload: cards });
    dispatch({ type: 'SET_CATEGORIES', payload: categories });
  };

  const contextValue: CardContextType = {
    state,
    dispatch,
    addCard,
    updateCard,
    deleteCard,
    deleteSelectedCards,
    addCategory,
    updateCategory,
    deleteCategory,
    getFilteredAndSortedCards,
    refreshData,
  };

  return (
    <CardContext.Provider value={contextValue}>
      {children}
    </CardContext.Provider>
  );
}

// Hook to use the context
export function useCardContext() {
  const context = useContext(CardContext);
  if (context === undefined) {
    throw new Error('useCardContext must be used within a CardProvider');
  }
  return context;
}