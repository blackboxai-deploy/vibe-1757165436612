import { Card, Category, DEFAULT_CATEGORIES } from './types';

// Storage keys
const STORAGE_KEYS = {
  CARDS: 'card-management-cards',
  CATEGORIES: 'card-management-categories',
  SETTINGS: 'card-management-settings',
} as const;

// Generic localStorage utilities
export const storage = {
  get: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage:`, error);
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage:`, error);
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage:`, error);
    }
  },

  clear: (): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.clear();
    } catch (error) {
      console.error(`Error clearing localStorage:`, error);
    }
  },
};

// Card storage operations
export const cardStorage = {
  // Get all cards
  getCards: (): Card[] => {
    const cards = storage.get<Card[]>(STORAGE_KEYS.CARDS) || [];
    // Convert date strings back to Date objects
    return cards.map(card => ({
      ...card,
      createdAt: new Date(card.createdAt),
      updatedAt: new Date(card.updatedAt),
      dueDate: card.dueDate ? new Date(card.dueDate) : null,
    }));
  },

  // Save all cards
  setCards: (cards: Card[]): void => {
    storage.set(STORAGE_KEYS.CARDS, cards);
  },

  // Add a new card
  addCard: (card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Card => {
    const cards = cardStorage.getCards();
    const newCard: Card = {
      ...card,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    cards.push(newCard);
    cardStorage.setCards(cards);
    return newCard;
  },

  // Update an existing card
  updateCard: (id: string, updates: Partial<Omit<Card, 'id' | 'createdAt'>>): Card | null => {
    const cards = cardStorage.getCards();
    const index = cards.findIndex(card => card.id === id);
    
    if (index === -1) return null;
    
    const updatedCard = {
      ...cards[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    cards[index] = updatedCard;
    cardStorage.setCards(cards);
    return updatedCard;
  },

  // Delete a card
  deleteCard: (id: string): boolean => {
    const cards = cardStorage.getCards();
    const filteredCards = cards.filter(card => card.id !== id);
    
    if (filteredCards.length === cards.length) return false;
    
    cardStorage.setCards(filteredCards);
    return true;
  },

  // Delete multiple cards
  deleteCards: (ids: string[]): number => {
    const cards = cardStorage.getCards();
    const filteredCards = cards.filter(card => !ids.includes(card.id));
    const deletedCount = cards.length - filteredCards.length;
    
    cardStorage.setCards(filteredCards);
    return deletedCount;
  },

  // Get a single card by ID
  getCard: (id: string): Card | null => {
    const cards = cardStorage.getCards();
    return cards.find(card => card.id === id) || null;
  },

  // Clear all cards
  clearCards: (): void => {
    storage.remove(STORAGE_KEYS.CARDS);
  },
};

// Category storage operations
export const categoryStorage = {
  // Get all categories
  getCategories: (): Category[] => {
    const categories = storage.get<Category[]>(STORAGE_KEYS.CATEGORIES);
    if (!categories) {
      // Initialize with default categories
      categoryStorage.setCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    
    // Convert date strings back to Date objects
    return categories.map(category => ({
      ...category,
      createdAt: new Date(category.createdAt),
    }));
  },

  // Save all categories
  setCategories: (categories: Category[]): void => {
    storage.set(STORAGE_KEYS.CATEGORIES, categories);
  },

  // Add a new category
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>): Category => {
    const categories = categoryStorage.getCategories();
    const newCategory: Category = {
      ...category,
      id: generateId(),
      createdAt: new Date(),
    };
    categories.push(newCategory);
    categoryStorage.setCategories(categories);
    return newCategory;
  },

  // Update an existing category
  updateCategory: (id: string, updates: Partial<Omit<Category, 'id' | 'createdAt'>>): Category | null => {
    const categories = categoryStorage.getCategories();
    const index = categories.findIndex(category => category.id === id);
    
    if (index === -1) return null;
    
    const updatedCategory = {
      ...categories[index],
      ...updates,
    };
    
    categories[index] = updatedCategory;
    categoryStorage.setCategories(categories);
    return updatedCategory;
  },

  // Delete a category
  deleteCategory: (id: string): boolean => {
    const categories = categoryStorage.getCategories();
    const filteredCategories = categories.filter(category => category.id !== id);
    
    if (filteredCategories.length === categories.length) return false;
    
    categoryStorage.setCategories(filteredCategories);
    return true;
  },

  // Get a single category by ID
  getCategory: (id: string): Category | null => {
    const categories = categoryStorage.getCategories();
    return categories.find(category => category.id === id) || null;
  },
};

// Export/Import utilities
export const dataManager = {
  // Export all data
  exportData: () => {
    const cards = cardStorage.getCards();
    const categories = categoryStorage.getCategories();
    
    const exportData = {
      cards,
      categories,
      exportedAt: new Date(),
      version: '1.0.0',
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cards-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  },

  // Import data from file
  importData: (file: File): Promise<{ success: boolean; message: string; data?: { cards: number; categories: number } }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importData = JSON.parse(content);
          
          if (!importData.cards || !Array.isArray(importData.cards)) {
            resolve({ success: false, message: 'Invalid file format: missing cards array' });
            return;
          }
          
          // Validate and import cards
          const validCards = importData.cards.filter((card: any) => 
            card.id && card.title && card.category
          );
          
          if (validCards.length === 0) {
            resolve({ success: false, message: 'No valid cards found in file' });
            return;
          }
          
          // Import categories if available
          let validCategories: Category[] = [];
          if (importData.categories && Array.isArray(importData.categories)) {
            validCategories = importData.categories.filter((category: any) =>
              category.id && category.name && category.color
            );
          }
          
          // Merge with existing data
          const existingCards = cardStorage.getCards();
          const existingCategories = categoryStorage.getCategories();
          
          // Avoid duplicates by ID
          const cardIds = new Set(existingCards.map(card => card.id));
          const categoryIds = new Set(existingCategories.map(category => category.id));
          
          const newCards = validCards.filter((card: Card) => !cardIds.has(card.id));
          const newCategories = validCategories.filter((category: Category) => !categoryIds.has(category.id));
          
          cardStorage.setCards([...existingCards, ...newCards]);
          
          if (newCategories.length > 0) {
            categoryStorage.setCategories([...existingCategories, ...newCategories]);
          }
          
          resolve({
            success: true,
            message: `Successfully imported ${newCards.length} cards and ${newCategories.length} categories`,
            data: {
              cards: newCards.length,
              categories: newCategories.length,
            },
          });
        } catch (error) {
          resolve({ success: false, message: 'Failed to parse file: Invalid JSON format' });
        }
      };
      
      reader.onerror = () => {
        resolve({ success: false, message: 'Failed to read file' });
      };
      
      reader.readAsText(file);
    });
  },

  // Clear all data
  clearAllData: (): void => {
    cardStorage.clearCards();
    storage.remove(STORAGE_KEYS.CATEGORIES);
    storage.remove(STORAGE_KEYS.SETTINGS);
  },
};

// Utility functions
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get all unique tags from cards
export const getUniqueTags = (): string[] => {
  const cards = cardStorage.getCards();
  const tagSet = new Set<string>();
  
  cards.forEach(card => {
    card.tags.forEach(tag => tagSet.add(tag));
  });
  
  return Array.from(tagSet).sort();
};