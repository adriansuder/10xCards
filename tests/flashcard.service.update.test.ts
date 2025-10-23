/**
 * Unit tests for flashcard.service.updateFlashcard method
 * 
 * These tests demonstrate how to test the update flashcard functionality.
 * They use Vitest as the testing framework (you'll need to install it).
 * 
 * To run these tests:
 * 1. Install dependencies: npm install -D vitest @vitest/ui
 * 2. Add test script to package.json: "test": "vitest"
 * 3. Run: npm test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { flashcardService } from '../src/lib/services/flashcard.service';
import { FlashcardDetailDto, UpdateFlashcardCommand } from '../src/types';

// Mock Supabase client
const createMockSupabaseClient = () => {
  const mockClient: any = {
    from: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn(),
  };
  return mockClient;
};

describe('flashcardService.updateFlashcard', () => {
  let mockSupabase: any;
  const userId = 'user-123';
  const flashcardId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
  });

  describe('Successful Updates', () => {
    it('should update a single field (front)', async () => {
      const updateData: UpdateFlashcardCommand = {
        front: 'Updated front text',
      };

      const expectedFlashcard: FlashcardDetailDto = {
        id: flashcardId,
        user_id: userId,
        front: 'Updated front text',
        back: 'Original back',
        part_of_speech: 'noun',
        leitner_box: 1,
        review_due_at: '2025-10-23T10:00:00.000Z',
        created_at: '2025-10-22T10:00:00.000Z',
        updated_at: '2025-10-23T12:00:00.000Z',
      };

      mockSupabase.single.mockResolvedValue({
        data: expectedFlashcard,
        error: null,
      });

      const result = await flashcardService.updateFlashcard(
        mockSupabase,
        flashcardId,
        userId,
        updateData
      );

      expect(result).toEqual(expectedFlashcard);
      expect(mockSupabase.from).toHaveBeenCalledWith('flashcards');
      expect(mockSupabase.update).toHaveBeenCalledWith(updateData);
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', flashcardId);
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', userId);
    });

    it('should update multiple fields', async () => {
      const updateData: UpdateFlashcardCommand = {
        front: 'New front',
        back: 'New back',
        part_of_speech: 'verb',
      };

      const expectedFlashcard: FlashcardDetailDto = {
        id: flashcardId,
        user_id: userId,
        front: 'New front',
        back: 'New back',
        part_of_speech: 'verb',
        leitner_box: 2,
        review_due_at: '2025-10-24T10:00:00.000Z',
        created_at: '2025-10-22T10:00:00.000Z',
        updated_at: '2025-10-23T12:00:00.000Z',
      };

      mockSupabase.single.mockResolvedValue({
        data: expectedFlashcard,
        error: null,
      });

      const result = await flashcardService.updateFlashcard(
        mockSupabase,
        flashcardId,
        userId,
        updateData
      );

      expect(result).toEqual(expectedFlashcard);
      expect(mockSupabase.update).toHaveBeenCalledWith(updateData);
    });

    it('should update part_of_speech to null', async () => {
      const updateData: UpdateFlashcardCommand = {
        part_of_speech: null,
      };

      const expectedFlashcard: FlashcardDetailDto = {
        id: flashcardId,
        user_id: userId,
        front: 'Original front',
        back: 'Original back',
        part_of_speech: null,
        leitner_box: 1,
        review_due_at: '2025-10-23T10:00:00.000Z',
        created_at: '2025-10-22T10:00:00.000Z',
        updated_at: '2025-10-23T12:00:00.000Z',
      };

      mockSupabase.single.mockResolvedValue({
        data: expectedFlashcard,
        error: null,
      });

      const result = await flashcardService.updateFlashcard(
        mockSupabase,
        flashcardId,
        userId,
        updateData
      );

      expect(result).toEqual(expectedFlashcard);
      expect(result?.part_of_speech).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should return null when flashcard is not found (PGRST116)', async () => {
      const updateData: UpdateFlashcardCommand = {
        front: 'Updated text',
      };

      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows returned' },
      });

      const result = await flashcardService.updateFlashcard(
        mockSupabase,
        flashcardId,
        userId,
        updateData
      );

      expect(result).toBeNull();
    });

    it('should return null when user does not own the flashcard (RLS)', async () => {
      const updateData: UpdateFlashcardCommand = {
        front: 'Trying to update someone elses card',
      };

      const differentUserId = 'other-user-456';

      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows returned' },
      });

      const result = await flashcardService.updateFlashcard(
        mockSupabase,
        flashcardId,
        differentUserId,
        updateData
      );

      expect(result).toBeNull();
    });

    it('should throw error for database operation failures', async () => {
      const updateData: UpdateFlashcardCommand = {
        front: 'Updated text',
      };

      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST500', message: 'Internal server error' },
      });

      await expect(
        flashcardService.updateFlashcard(mockSupabase, flashcardId, userId, updateData)
      ).rejects.toThrow('Database operation failed.');
    });

    it('should throw error for network failures', async () => {
      const updateData: UpdateFlashcardCommand = {
        front: 'Updated text',
      };

      mockSupabase.single.mockRejectedValue(new Error('Network error'));

      await expect(
        flashcardService.updateFlashcard(mockSupabase, flashcardId, userId, updateData)
      ).rejects.toThrow('Network error');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty update data object', async () => {
      const updateData: UpdateFlashcardCommand = {};

      const expectedFlashcard: FlashcardDetailDto = {
        id: flashcardId,
        user_id: userId,
        front: 'Original front',
        back: 'Original back',
        part_of_speech: 'noun',
        leitner_box: 1,
        review_due_at: '2025-10-23T10:00:00.000Z',
        created_at: '2025-10-22T10:00:00.000Z',
        updated_at: '2025-10-23T12:00:00.000Z',
      };

      mockSupabase.single.mockResolvedValue({
        data: expectedFlashcard,
        error: null,
      });

      const result = await flashcardService.updateFlashcard(
        mockSupabase,
        flashcardId,
        userId,
        updateData
      );

      expect(result).toEqual(expectedFlashcard);
      expect(mockSupabase.update).toHaveBeenCalledWith({});
    });

    it('should preserve fields that are not being updated', async () => {
      const updateData: UpdateFlashcardCommand = {
        front: 'Updated front only',
      };

      const expectedFlashcard: FlashcardDetailDto = {
        id: flashcardId,
        user_id: userId,
        front: 'Updated front only',
        back: 'Original back (unchanged)',
        part_of_speech: 'noun (unchanged)',
        leitner_box: 3,
        review_due_at: '2025-10-25T10:00:00.000Z',
        created_at: '2025-10-22T10:00:00.000Z',
        updated_at: '2025-10-23T12:00:00.000Z',
      };

      mockSupabase.single.mockResolvedValue({
        data: expectedFlashcard,
        error: null,
      });

      const result = await flashcardService.updateFlashcard(
        mockSupabase,
        flashcardId,
        userId,
        updateData
      );

      // Verify that unchanged fields remain intact
      expect(result?.back).toBe('Original back (unchanged)');
      expect(result?.part_of_speech).toBe('noun (unchanged)');
      expect(result?.leitner_box).toBe(3);
    });
  });

  describe('Integration with Database', () => {
    it('should call Supabase methods in correct order', async () => {
      const updateData: UpdateFlashcardCommand = {
        front: 'Updated text',
      };

      const expectedFlashcard: FlashcardDetailDto = {
        id: flashcardId,
        user_id: userId,
        front: 'Updated text',
        back: 'Original back',
        part_of_speech: 'noun',
        leitner_box: 1,
        review_due_at: '2025-10-23T10:00:00.000Z',
        created_at: '2025-10-22T10:00:00.000Z',
        updated_at: '2025-10-23T12:00:00.000Z',
      };

      mockSupabase.single.mockResolvedValue({
        data: expectedFlashcard,
        error: null,
      });

      await flashcardService.updateFlashcard(mockSupabase, flashcardId, userId, updateData);

      // Verify call order
      expect(mockSupabase.from).toHaveBeenCalledBefore(mockSupabase.update);
      expect(mockSupabase.update).toHaveBeenCalledBefore(mockSupabase.eq);
      expect(mockSupabase.select).toHaveBeenCalledBefore(mockSupabase.single);
    });

    it('should select all fields after update', async () => {
      const updateData: UpdateFlashcardCommand = {
        front: 'Updated text',
      };

      mockSupabase.single.mockResolvedValue({
        data: {},
        error: null,
      });

      await flashcardService.updateFlashcard(mockSupabase, flashcardId, userId, updateData);

      expect(mockSupabase.select).toHaveBeenCalledWith('*');
    });
  });
});
