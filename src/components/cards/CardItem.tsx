'use client';

import React, { useState } from 'react';
import { Card, PRIORITY_CONFIG } from '@/lib/types';
import { useCardContext } from '@/context/CardContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card as CardComponent,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CardForm } from './CardForm';
import { format, isBefore, isToday, addDays } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CardItemProps {
  card: Card;
  isSelected: boolean;
  onToggleSelect: (cardId: string) => void;
  viewMode?: 'grid' | 'list';
}

export function CardItem({ card, isSelected, onToggleSelect, viewMode = 'grid' }: CardItemProps) {
  const { state, updateCard, deleteCard } = useCardContext();
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Find category details
  const category = state.categories.find(cat => cat.id === card.category);
  
  // Priority configuration
  const priorityConfig = PRIORITY_CONFIG[card.priority];

  // Due date status
  const getDueDateStatus = () => {
    if (!card.dueDate) return null;
    
    const dueDate = new Date(card.dueDate);
    const today = new Date();
    const tomorrow = addDays(today, 1);
    
    if (isToday(dueDate)) {
      return { status: 'today', color: 'text-orange-600', label: 'Due Today' };
    } else if (isBefore(dueDate, today)) {
      return { status: 'overdue', color: 'text-red-600', label: 'Overdue' };
    } else if (isToday(dueDate) || dueDate <= tomorrow) {
      return { status: 'soon', color: 'text-yellow-600', label: 'Due Soon' };
    } else {
      return { status: 'upcoming', color: 'text-muted-foreground', label: format(dueDate, 'MMM d, yyyy') };
    }
  };

  const dueDateStatus = getDueDateStatus();

  const handleToggleComplete = async () => {
    try {
      await updateCard(card.id, { completed: !card.completed });
      toast.success(card.completed ? 'Card marked as incomplete' : 'Card marked as complete');
    } catch {
      toast.error('Failed to update card');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCard(card.id);
      toast.success('Card deleted successfully');
      setIsDeleteDialogOpen(false);
    } catch {
      toast.error('Failed to delete card');
    }
  };

  const handleDuplicate = async () => {
    try {
      await addCard({
        title: `${card.title} (Copy)`,
        description: card.description,
        category: card.category,
        tags: card.tags,
        priority: card.priority,
        dueDate: card.dueDate,
        completed: false,
      });
      toast.success('Card duplicated successfully');
    } catch {
      toast.error('Failed to duplicate card');
    }
  };

  if (viewMode === 'list') {
    return (
      <>
        <div className={cn(
          'flex items-center space-x-4 p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow',
          isSelected && 'ring-2 ring-primary',
          card.completed && 'opacity-60'
        )}>
          {/* Selection Checkbox */}
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(card.id)}
          />

          {/* Completion Checkbox */}
          <Checkbox
            checked={card.completed}
            onCheckedChange={handleToggleComplete}
          />

          {/* Card Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className={cn(
                  'font-medium text-sm',
                  card.completed && 'line-through text-muted-foreground'
                )}>
                  {card.title}
                </h3>
                {card.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {card.description}
                  </p>
                )}
              </div>
              
              {/* Metadata */}
              <div className="flex items-center space-x-2 ml-4">
                {/* Category */}
                {category && (
                  <Badge variant="outline" className="text-xs">
                    <div
                      className="w-2 h-2 rounded-full mr-1"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </Badge>
                )}

                {/* Priority */}
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs',
                    priorityConfig.color,
                    'dark:' + priorityConfig.darkColor
                  )}
                >
                  {priorityConfig.label}
                </Badge>

                {/* Due Date */}
                {dueDateStatus && (
                  <span className={cn('text-xs font-medium', dueDateStatus.color)}>
                    {dueDateStatus.label}
                  </span>
                )}

                {/* Tags */}
                <div className="flex space-x-1">
                  {card.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                  {card.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{card.tags.length - 2}
                    </Badge>
                  )}
                </div>

                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      ⋯
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditFormOpen(true)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDuplicate}>
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleToggleComplete}>
                      {card.completed ? 'Mark Incomplete' : 'Mark Complete'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <CardForm
          card={card}
          isOpen={isEditFormOpen}
          onClose={() => setIsEditFormOpen(false)}
        />

        {/* Delete Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Card</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{card.title}&quot;? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Grid View
  return (
    <>
      <CardComponent className={cn(
        'h-full transition-all hover:shadow-md',
        isSelected && 'ring-2 ring-primary',
        card.completed && 'opacity-60'
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-2 flex-1">
              {/* Selection Checkbox */}
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSelect(card.id)}
                className="mt-1"
              />
              
              <div className="flex-1 min-w-0">
                <CardTitle className={cn(
                  'text-base leading-tight',
                  card.completed && 'line-through text-muted-foreground'
                )}>
                  {card.title}
                </CardTitle>
              </div>
            </div>
            
            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  ⋯
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditFormOpen(true)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate}>
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleComplete}>
                  {card.completed ? 'Mark Incomplete' : 'Mark Complete'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-destructive"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Category and Priority */}
          <div className="flex items-center justify-between">
            {category && (
              <Badge variant="outline" className="text-xs">
                <div
                  className="w-2 h-2 rounded-full mr-1"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </Badge>
            )}
            
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                priorityConfig.color,
                'dark:' + priorityConfig.darkColor
              )}
            >
              {priorityConfig.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Description */}
          {card.description && (
            <CardDescription className="text-sm mb-4 line-clamp-3">
              {card.description}
            </CardDescription>
          )}

          {/* Tags */}
          {card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {card.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={card.completed}
                onCheckedChange={handleToggleComplete}
              />
              <span className="text-xs text-muted-foreground">
                {card.completed ? 'Completed' : 'Complete'}
              </span>
            </div>

            {dueDateStatus && (
              <span className={cn('text-xs font-medium', dueDateStatus.color)}>
                {dueDateStatus.label}
              </span>
            )}
          </div>
        </CardContent>
      </CardComponent>

      {/* Edit Form */}
      <CardForm
        card={card}
        isOpen={isEditFormOpen}
        onClose={() => setIsEditFormOpen(false)}
      />

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{card.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}