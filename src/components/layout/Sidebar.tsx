'use client';

import React from 'react';
import { useCardContext } from '@/context/CardContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PRIORITY_CONFIG, Priority } from '@/lib/types';

export function Sidebar() {
  const { state, dispatch } = useCardContext();

  const handleCategoryFilter = (categoryId: string, checked: boolean) => {
    const currentCategories = state.filters.categories;
    const newCategories = checked
      ? [...currentCategories, categoryId]
      : currentCategories.filter(id => id !== categoryId);
    
    dispatch({ type: 'SET_FILTERS', payload: { categories: newCategories } });
  };

  const handleTagFilter = (tag: string, checked: boolean) => {
    const currentTags = state.filters.tags;
    const newTags = checked
      ? [...currentTags, tag]
      : currentTags.filter(t => t !== tag);
    
    dispatch({ type: 'SET_FILTERS', payload: { tags: newTags } });
  };

  const handlePriorityFilter = (priority: Priority, checked: boolean) => {
    const currentPriorities = state.filters.priorities;
    const newPriorities = checked
      ? [...currentPriorities, priority]
      : currentPriorities.filter(p => p !== priority);
    
    dispatch({ type: 'SET_FILTERS', payload: { priorities: newPriorities } });
  };

  const handleShowCompletedToggle = (checked: boolean) => {
    dispatch({ type: 'SET_FILTERS', payload: { showCompleted: checked } });
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-') as [any, 'asc' | 'desc'];
    dispatch({ type: 'SET_SORT', payload: { sortBy, sortOrder } });
  };

  const clearAllFilters = () => {
    dispatch({
      type: 'SET_FILTERS',
      payload: {
        search: '',
        categories: [],
        tags: [],
        priorities: [],
        showCompleted: true,
        dueDateRange: { from: null, to: null },
      },
    });
  };

  const activeFiltersCount = 
    state.filters.categories.length +
    state.filters.tags.length +
    state.filters.priorities.length +
    (state.filters.search ? 1 : 0) +
    (!state.filters.showCompleted ? 1 : 0);

  const getCategoryCardCount = (categoryId: string) => {
    return state.cards.filter(card => card.category === categoryId).length;
  };

  const getTagCardCount = (tag: string) => {
    return state.cards.filter(card => card.tags.includes(tag)).length;
  };

  const getPriorityCardCount = (priority: Priority) => {
    return state.cards.filter(card => card.priority === priority).length;
  };

  return (
    <aside className="w-80 border-r bg-card">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Filters</h2>
          {activeFiltersCount > 0 && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{activeFiltersCount}</Badge>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            </div>
          )}
        </div>

        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-6">
            {/* Sort */}
            <div>
              <h3 className="text-sm font-medium mb-3">Sort by</h3>
              <Select
                value={`${state.sort.sortBy}-${state.sort.sortOrder}`}
                onValueChange={handleSortChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updatedAt-desc">Recently Updated</SelectItem>
                  <SelectItem value="updatedAt-asc">Oldest Updated</SelectItem>
                  <SelectItem value="createdAt-desc">Recently Created</SelectItem>
                  <SelectItem value="createdAt-asc">Oldest Created</SelectItem>
                  <SelectItem value="title-asc">Title A-Z</SelectItem>
                  <SelectItem value="title-desc">Title Z-A</SelectItem>
                  <SelectItem value="priority-desc">High Priority First</SelectItem>
                  <SelectItem value="priority-asc">Low Priority First</SelectItem>
                  <SelectItem value="dueDate-asc">Due Date (Soon First)</SelectItem>
                  <SelectItem value="dueDate-desc">Due Date (Late First)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Show Completed Toggle */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-completed"
                checked={state.filters.showCompleted}
                onCheckedChange={handleShowCompletedToggle}
              />
              <label
                htmlFor="show-completed"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Show completed cards
              </label>
            </div>

            <Separator />

            {/* Categories */}
            <div>
              <h3 className="text-sm font-medium mb-3">Categories</h3>
              <div className="space-y-2">
                {state.categories.map(category => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={state.filters.categories.includes(category.id)}
                      onCheckedChange={(checked) => 
                        handleCategoryFilter(category.id, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="flex-1 flex items-center justify-between text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {getCategoryCardCount(category.id)}
                      </Badge>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            {state.uniqueTags.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium mb-3">Tags</h3>
                  <div className="space-y-2">
                    {state.uniqueTags.slice(0, 10).map(tag => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tag-${tag}`}
                          checked={state.filters.tags.includes(tag)}
                          onCheckedChange={(checked) => 
                            handleTagFilter(tag, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={`tag-${tag}`}
                          className="flex-1 flex items-center justify-between text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          <span>#{tag}</span>
                          <Badge variant="outline" className="text-xs">
                            {getTagCardCount(tag)}
                          </Badge>
                        </label>
                      </div>
                    ))}
                    {state.uniqueTags.length > 10 && (
                      <p className="text-xs text-muted-foreground">
                        +{state.uniqueTags.length - 10} more tags
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Priority */}
            <Separator />
            <div>
              <h3 className="text-sm font-medium mb-3">Priority</h3>
              <div className="space-y-2">
                {Object.entries(PRIORITY_CONFIG).map(([priority, config]) => (
                  <div key={priority} className="flex items-center space-x-2">
                    <Checkbox
                      id={`priority-${priority}`}
                      checked={state.filters.priorities.includes(priority as Priority)}
                      onCheckedChange={(checked) => 
                        handlePriorityFilter(priority as Priority, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`priority-${priority}`}
                      className="flex-1 flex items-center justify-between text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <span>{config.label}</span>
                      <Badge variant="outline" className="text-xs">
                        {getPriorityCardCount(priority as Priority)}
                      </Badge>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <Separator />
            <div>
              <h3 className="text-sm font-medium mb-3">Statistics</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Total Cards:</span>
                  <span>{state.cards.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed:</span>
                  <span>{state.cards.filter(card => card.completed).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active:</span>
                  <span>{state.cards.filter(card => !card.completed).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Categories:</span>
                  <span>{state.categories.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Unique Tags:</span>
                  <span>{state.uniqueTags.length}</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}