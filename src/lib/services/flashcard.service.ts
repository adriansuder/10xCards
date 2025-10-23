import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  CreateFlashcardCommand,
  CreatedFlashcardDto,
  FlashcardDetailDto,
  FlashcardListItemDto,
  ImportFlashcardsCommand,
  ImportFlashcardsResponseDto,
  ListFlashcardsResponseDto,
  UpdateFlashcardCommand,
} from '../../types';
import type { Database } from '../../db/database.types';

export type GetFlashcardsOptions = {
  page: number;
  pageSize: number;
  sortBy: 'created_at' | 'front' | 'leitner_box';
  order: 'asc' | 'desc';
};

export const flashcardService = {
  async getFlashcards(
    supabase: SupabaseClient<Database>,
    userId: string,
    options: GetFlashcardsOptions
  ): Promise<ListFlashcardsResponseDto> {
    const { page, pageSize, sortBy, order } = options;
    const offset = (page - 1) * pageSize;

    const { count, error: countError } = await supabase
      .from('flashcards')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      console.error('Error counting flashcards:', countError);
      throw new Error('Failed to count flashcards.');
    }

    const totalItems = count ?? 0;
    const totalPages = Math.ceil(totalItems / pageSize);

    const { data: flashcards, error } = await supabase
      .from('flashcards')
      .select('id, front, back, part_of_speech, leitner_box, review_due_at, created_at')
      .eq('user_id', userId)
      .order(sortBy, { ascending: order === 'asc' })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('Error fetching flashcards:', error);
      throw new Error('Failed to fetch flashcards.');
    }

    return {
      data: flashcards as FlashcardListItemDto[],
      pagination: {
        currentPage: page,
        pageSize,
        totalItems,
        totalPages,
      },
    };
  },

  async createFlashcard(
    supabase: SupabaseClient<Database>,
    userId: string,
    data: CreateFlashcardCommand
  ): Promise<CreatedFlashcardDto> {
    const { front, back, part_of_speech } = data;

    const { data: newFlashcard, error } = await supabase
      .from('flashcards')
      .insert({
        user_id: userId,
        front,
        back,
        part_of_speech,
        leitner_box: 1,
        review_due_at: new Date().toISOString(),
      })
      .select('id, front, back, part_of_speech, leitner_box, review_due_at, created_at')
      .single();

    if (error) {
      console.error('Error creating flashcard in database:', error);
      throw new Error('Database operation failed.');
    }

    return newFlashcard;
  },

  async getFlashcardById(
    supabase: SupabaseClient<Database>,
    flashcardId: string
  ): Promise<FlashcardDetailDto | null> {
    const { data, error } = await supabase.from('flashcards').select('*').eq('id', flashcardId).single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching flashcard from database:', error);
      throw new Error('Database operation failed.');
    }

    return data;
  },

  async importAiFlashcards(
    supabase: SupabaseClient<Database>,
    userId: string,
    command: ImportFlashcardsCommand,
    languageLevel: string
  ): Promise<ImportFlashcardsResponseDto> {
    const { flashcards, metrics } = command;

    // @ts-expect-error - This is a temporary workaround until Supabase types are regenerated.
    const { data, error } = await supabase.rpc('import_ai_flashcards', {
      flashcards_data: flashcards,
      metrics_data: metrics,
      user_id_input: userId,
      language_level_input: languageLevel,
    });

    if (error) {
      console.error('Error calling import_ai_flashcards RPC:', error);
      throw new Error('Database transaction failed.');
    }

    return data as any as ImportFlashcardsResponseDto;
  },

  /**
   * Updates an existing flashcard for the authenticated user.
   * Uses RLS policies to ensure users can only update their own flashcards.
   * 
   * @param supabase - Supabase client instance
   * @param flashcardId - UUID of the flashcard to update
   * @param userId - ID of the authenticated user
   * @param data - Partial update data for the flashcard
   * @returns Updated flashcard or null if not found
   * @throws Error if database operation fails
   */
  async updateFlashcard(
    supabase: SupabaseClient<Database>,
    flashcardId: string,
    userId: string,
    data: UpdateFlashcardCommand
  ): Promise<FlashcardDetailDto | null> {
    const { data: updatedFlashcard, error } = await supabase
      .from('flashcards')
      .update(data)
      .eq('id', flashcardId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) {
      // PGRST116 is the error code for "no rows returned"
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error updating flashcard in database:', error);
      throw new Error('Database operation failed.');
    }

    return updatedFlashcard;
  },
};
