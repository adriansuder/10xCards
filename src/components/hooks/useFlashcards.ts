/**
 * Custom hook for managing flashcards list state and API interactions.
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  FlashcardTableViewModel,
  ListFlashcardsResponseDto,
  UpdateFlashcardCommand,
  FlashcardListQueryParams,
} from '../../types';

const DEFAULT_PAGE_SIZE = 20;

/**
 * Custom hook for managing flashcards data, pagination, and CRUD operations.
 * @param initialPage - Initial page number (default: 1)
 * @returns Flashcard state and methods for CRUD operations
 */
export const useFlashcards = (initialPage: number = 1) => {
  const [viewModel, setViewModel] = useState<FlashcardTableViewModel>({
    flashcards: [],
    pagination: {
      currentPage: initialPage,
      pageSize: DEFAULT_PAGE_SIZE,
      totalItems: 0,
      totalPages: 0,
    },
    isLoading: true,
    error: null,
  });

  /**
   * Fetches flashcards from the API for the specified page.
   */
  const fetchFlashcards = useCallback(async (page: number) => {
    setViewModel((prev: FlashcardTableViewModel) => ({ ...prev, isLoading: true, error: null }));

    try {
      const params: FlashcardListQueryParams = {
        page,
        pageSize: DEFAULT_PAGE_SIZE,
        sortBy: 'created_at',
        order: 'desc',
      };

      const queryString = new URLSearchParams(
        Object.entries(params).reduce(
          (acc, [key, value]) => {
            if (value !== undefined) {
              acc[key] = String(value);
            }
            return acc;
          },
          {} as Record<string, string>
        )
      ).toString();

      const response = await fetch(`/api/flashcards?${queryString}`);

      if (!response.ok) {
        if (response.status === 401) {
          // Redirect to login if unauthorized
          window.location.href = '/login';
          return;
        }
        throw new Error(`Failed to fetch flashcards: ${response.statusText}`);
      }

      const data: ListFlashcardsResponseDto = await response.json();

      setViewModel({
        flashcards: data.data,
        pagination: data.pagination,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Wystąpił nieoczekiwany błąd';
      setViewModel((prev: FlashcardTableViewModel) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, []);

  /**
   * Updates a flashcard with the given data.
   */
  const updateFlashcard = useCallback(
    async (id: string, data: UpdateFlashcardCommand) => {
      try {
        const response = await fetch(`/api/flashcards/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = '/login';
            return;
          }
          if (response.status === 404) {
            throw new Error('Fiszka nie została znaleziona');
          }
          if (response.status === 422) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Błąd walidacji danych');
          }
          throw new Error('Nie udało się zaktualizować fiszki');
        }

        // Refresh the current page after successful update
        await fetchFlashcards(viewModel.pagination.currentPage);
      } catch (error) {
        throw error instanceof Error ? error : new Error('Nieoczekiwany błąd');
      }
    },
    [fetchFlashcards, viewModel.pagination.currentPage]
  );

  /**
   * Deletes a flashcard with optimistic UI update.
   */
  const deleteFlashcard = useCallback(
    async (id: string) => {
      // Optimistic update: remove from UI immediately
      const previousFlashcards = viewModel.flashcards;
      setViewModel((prev: FlashcardTableViewModel) => ({
        ...prev,
        flashcards: prev.flashcards.filter((f) => f.id !== id),
      }));

      try {
        const response = await fetch(`/api/flashcards/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = '/login';
            return;
          }
          if (response.status === 404) {
            throw new Error('Fiszka nie została znaleziona');
          }
          throw new Error('Nie udało się usunąć fiszki');
        }

        // Refresh to get updated pagination
        await fetchFlashcards(viewModel.pagination.currentPage);
      } catch (error) {
        // Rollback optimistic update on error
        setViewModel((prev: FlashcardTableViewModel) => ({
          ...prev,
          flashcards: previousFlashcards,
        }));
        throw error instanceof Error ? error : new Error('Nieoczekiwany błąd');
      }
    },
    [fetchFlashcards, viewModel.flashcards, viewModel.pagination.currentPage]
  );

  /**
   * Changes the current page and fetches new data.
   */
  const changePage = useCallback(
    (page: number) => {
      if (page < 1 || page > viewModel.pagination.totalPages) {
        return;
      }
      fetchFlashcards(page);
    },
    [fetchFlashcards, viewModel.pagination.totalPages]
  );

  // Fetch flashcards on mount and when initialPage changes
  useEffect(() => {
    fetchFlashcards(initialPage);
  }, [fetchFlashcards, initialPage]);

  return {
    viewModel,
    updateFlashcard,
    deleteFlashcard,
    changePage,
    refetch: () => fetchFlashcards(viewModel.pagination.currentPage),
  };
};
