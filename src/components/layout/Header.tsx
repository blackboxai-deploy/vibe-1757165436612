'use client';

import React from 'react';
import { useCardContext } from '@/context/CardContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useTheme } from 'next-themes';
import { dataManager } from '@/lib/storage';
import { toast } from 'sonner';

export function Header() {
  const { state, dispatch, deleteSelectedCards } = useCardContext();
  const { setTheme } = useTheme();

  const handleSearch = (value: string) => {
    dispatch({ type: 'SET_FILTERS', payload: { search: value } });
  };

  const handleViewModeToggle = () => {
    const newViewMode = state.viewMode === 'grid' ? 'list' : 'grid';
    dispatch({ type: 'SET_VIEW_MODE', payload: newViewMode });
  };

  const handleExportData = () => {
    try {
      dataManager.exportData();
      toast.success('Data exported successfully!');
    } catch {
      toast.error('Failed to export data');
    }
  };

  const handleImportData = async (file: File) => {
    try {
      const result = await dataManager.importData(file);
      if (result.success) {
        toast.success(result.message);
        // Refresh the context data
        const { refreshData } = useCardContext();
        await refreshData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to import data');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      handleImportData(file);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleDeleteSelected = async () => {
    try {
      const deletedCount = await deleteSelectedCards();
      toast.success(`Deleted ${deletedCount} card${deletedCount !== 1 ? 's' : ''}`);
    } catch (error) {
      toast.error('Failed to delete cards');
    }
  };

  const handleSelectAll = () => {
    const filteredCards = state.cards; // In a real app, you'd get filtered cards
    const allCardIds = filteredCards.map(card => card.id);
    dispatch({ type: 'SET_SELECTED_CARDS', payload: allCardIds });
  };

  const handleClearSelection = () => {
    dispatch({ type: 'CLEAR_SELECTION' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        {/* Logo and Title */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CM</span>
            </div>
            <h1 className="text-xl font-semibold">Card Management</h1>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-8">
          <Input
            type="search"
            placeholder="Search cards..."
            value={state.filters.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Selection Info */}
          {state.selectedCards.length > 0 && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {state.selectedCards.length} selected
              </Badge>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Delete Selected
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Selected Cards</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {state.selectedCards.length} selected card
                      {state.selectedCards.length !== 1 ? 's' : ''}? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteSelected}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button variant="outline" size="sm" onClick={handleClearSelection}>
                Clear Selection
              </Button>
            </div>
          )}

          {/* View Mode Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewModeToggle}
            className="hidden sm:flex"
          >
            {state.viewMode === 'grid' ? 'List View' : 'Grid View'}
          </Button>

          {/* Bulk Selection */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Select
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleSelectAll}>
                Select All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleClearSelection}>
                Clear Selection
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Data Management */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Data
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportData}>
                Export Data
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <label className="cursor-pointer">
                  Import Data
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </label>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Clear All Data
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear All Data</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to clear all cards and categories? This action cannot be undone.
                      Consider exporting your data first.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        dataManager.clearAllData();
                        window.location.reload();
                      }}
                    >
                      Clear All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Theme
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}