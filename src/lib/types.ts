import { z } from 'zod';

// Enums
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type ViewMode = 'grid' | 'list';
export type SortBy = 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title';
export type SortOrder = 'asc' | 'desc';

// Card Interface
export interface Card {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  priority: Priority;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  completed: boolean;
}

// Category Interface
export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

// Filter Interface
export interface FilterOptions {
  search: string;
  categories: string[];
  tags: string[];
  priorities: Priority[];
  showCompleted: boolean;
  dueDateRange: {
    from: Date | null;
    to: Date | null;
  };
}

// Sort Interface
export interface SortOptions {
  sortBy: SortBy;
  sortOrder: SortOrder;
}

// Zod Validation Schemas
export const CardSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).default([]),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  dueDate: z.date().nullable().optional(),
  completed: z.boolean().default(false),
});

export const CategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Category name is required').max(50, 'Category name must be less than 50 characters'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
});

export const FilterSchema = z.object({
  search: z.string().default(''),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  priorities: z.array(z.enum(['low', 'medium', 'high', 'critical'])).default([]),
  showCompleted: z.boolean().default(true),
  dueDateRange: z.object({
    from: z.date().nullable().default(null),
    to: z.date().nullable().default(null),
  }).default({ from: null, to: null }),
});

// Form Types
export type CardFormData = z.infer<typeof CardSchema>;
export type CategoryFormData = z.infer<typeof CategorySchema>;
export type FilterFormData = z.infer<typeof FilterSchema>;

// Priority configurations
export const PRIORITY_CONFIG = {
  low: {
    label: 'Low',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    darkColor: 'bg-gray-800 text-gray-200 border-gray-700',
  },
  medium: {
    label: 'Medium',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    darkColor: 'bg-blue-900 text-blue-200 border-blue-700',
  },
  high: {
    label: 'High',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    darkColor: 'bg-yellow-900 text-yellow-200 border-yellow-700',
  },
  critical: {
    label: 'Critical',
    color: 'bg-red-100 text-red-800 border-red-200',
    darkColor: 'bg-red-900 text-red-200 border-red-700',
  },
};

// Default categories
export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'work',
    name: 'Work',
    color: '#3b82f6',
    createdAt: new Date(),
  },
  {
    id: 'personal',
    name: 'Personal',
    color: '#10b981',
    createdAt: new Date(),
  },
  {
    id: 'projects',
    name: 'Projects',
    color: '#8b5cf6',
    createdAt: new Date(),
  },
  {
    id: 'ideas',
    name: 'Ideas',
    color: '#f59e0b',
    createdAt: new Date(),
  },
];