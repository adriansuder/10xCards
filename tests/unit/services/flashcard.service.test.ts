import { describe, it, expect, vi, beforeEach } from 'vitest';
import { flashcardService } from '../../../src/lib/services/flashcard.service';
import { createMockSupabaseClient, createMockFlashcard } from '../../setup/supabase.mock';

/**
 * Unit tests for flashcard.service.ts
 * 
 * Tests the business logic for flashcard operations including:
 * - Creating flashcards
 * - Fetching flashcards with pagination
 * - Updating flashcards
 * - Error handling
 */

describe('flashcard.service', () => {
  describe('createFlashcard', () => {
    it('should create a flashcard with valid data', async () => {
      // Arrange
      const mockFlashcard = createMockFlashcard({
        front: 'hello',
        back: 'cześć (powitanie)',
        part_of_speech: 'noun',
      });

      const mockSupabase = createMockSupabaseClient({
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockFlashcard,
                error: null,
              }),
            }),
          }),
        }),
      });

      // Act
      const result = await flashcardService.createFlashcard(
        mockSupabase,
        'test-user-id',
        {
          front: 'hello',
          back: 'cześć (powitanie)',
          part_of_speech: 'noun',
        }
      );

      // Assert
      expect(result).toEqual(mockFlashcard);
      expect(result.leitner_box).toBe(1);
      expect(result.front).toBe('hello');
    });

    it('should throw error when database operation fails', async () => {
      // Arrange
      const mockSupabase = createMockSupabaseClient({
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database error' },
              }),
            }),
          }),
        }),
      });

      // Act & Assert
      await expect(
        flashcardService.createFlashcard(mockSupabase, 'test-user-id', {
          front: 'test',
          back: 'test',
        })
      ).rejects.toThrow('Database operation failed');
    });
  });

  describe('getFlashcards', () => {
    it('should return paginated flashcards', async () => {
      // Arrange
      const mockFlashcards = [
        createMockFlashcard({ id: 'flash-1', front: 'hello' }),
        createMockFlashcard({ id: 'flash-2', front: 'goodbye' }),
      ];

      const mockSupabase = createMockSupabaseClient({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockImplementation((query: string) => {
            if (query === '*') {
              return {
                eq: vi.fn().mockResolvedValue({
                  count: 2,
                  error: null,
                }),
              };
            }
            return {
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  range: vi.fn().mockResolvedValue({
                    data: mockFlashcards,
                    error: null,
                  }),
                }),
              }),
            };
          }),
        }),
      });

      // Act
      const result = await flashcardService.getFlashcards(mockSupabase, 'test-user-id', {
        page: 1,
        pageSize: 20,
        sortBy: 'created_at',
        order: 'desc',
      });

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.totalItems).toBe(2);
    });
  });

  describe('updateFlashcard', () => {
    it('should update flashcard fields', async () => {
      // Arrange
      const updatedFlashcard = createMockFlashcard({
        front: 'updated hello',
        back: 'zaktualizowane cześć',
      });

      const mockSupabase = createMockSupabaseClient({
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: updatedFlashcard,
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      });

      // Act
      const result = await flashcardService.updateFlashcard(
        mockSupabase,
        'flashcard-123',
        'test-user-id',
        { front: 'updated hello' }
      );

      // Assert
      expect(result).toEqual(updatedFlashcard);
      expect(result?.front).toBe('updated hello');
    });

    it('should return null when flashcard not found', async () => {
      // Arrange
      const mockSupabase = createMockSupabaseClient({
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: null,
                    error: { code: 'PGRST116' },
                  }),
                }),
              }),
            }),
          }),
        }),
      });

      // Act
      const result = await flashcardService.updateFlashcard(
        mockSupabase,
        'non-existent-id',
        'test-user-id',
        { front: 'test' }
      );

      // Assert
      expect(result).toBeNull();
    });
  });
});
