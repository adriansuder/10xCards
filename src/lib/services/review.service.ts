import type { SupabaseClient } from '../../db/supabase.client';
import type { ReviewCardDto, UpdateCardReviewDto } from '../../types';
import { z } from 'zod';

export const GetReviewSessionCommandSchema = z.object({
  userId: z.string().uuid(),
  limit: z.number().int().min(1).max(100).default(50),
});

export type GetReviewSessionCommand = z.infer<typeof GetReviewSessionCommandSchema>;

export interface UpdateCardReviewCommand extends UpdateCardReviewDto {
  userId: string;
}

export class ReviewService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Retrieves flashcards due for review for a given user.
   *
   * @param command - The command object containing the user ID and limit.
   * @returns A promise that resolves to an array of review cards.
   */
  async getReviewSessionCards(command: GetReviewSessionCommand): Promise<ReviewCardDto[]> {
    const { userId, limit } = command;
    const now = new Date().toISOString();

    const { data: flashcards, error } = await this.supabase
      .from('flashcards')
      .select('id, front, back, part_of_speech')
      .eq('user_id', userId)
      .lte('review_due_at', now)
      .order('leitner_box', { ascending: true })
      .order('review_due_at', { ascending: true })
      .limit(limit);

    if (error) {
      // In a real app, you'd want to log this error to a monitoring service
      console.error('Error fetching review session cards:', error);
      throw new Error('Failed to retrieve review session cards from the database.');
    }

    return flashcards || [];
  }

  /**
   * Updates the review status of a flashcard by calling the update_flashcard_review RPC function.
   * This function handles the Leitner box progression logic and calculates the next review date.
   *
   * @param command - The command object containing flashcardId, knewIt, and userId.
   * @throws Error if the flashcard is not found or doesn't belong to the user.
   * @throws Error if the database operation fails.
   */
  async updateCardReviewStatus(command: UpdateCardReviewCommand): Promise<void> {
    const { flashcardId, knewIt } = command;

    const { error } = await this.supabase.rpc('update_flashcard_review', {
      p_flashcard_id: flashcardId,
      p_knew_it: knewIt,
    });

    if (error) {
      console.error('Error updating card review status:', error);

      // Check if the error is due to the flashcard not being found or not belonging to the user
      if (error.message?.includes('not found') || error.code === 'PGRST116') {
        throw new Error('FLASHCARD_NOT_FOUND');
      }

      throw new Error('Failed to update card review status.');
    }
  }
}
