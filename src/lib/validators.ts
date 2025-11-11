import { z } from 'zod';

/**
 * Schema for validating the creation of a new flashcard.
 * Ensures that 'front' and 'back' fields are non-empty strings and sets a maximum length.
 * 'part_of_speech' is optional.
 */
export const CreateFlashcardSchema = z.object({
  front: z.string({ required_error: 'Front is required.' }).min(1, 'Front cannot be empty.').max(255),
  back: z.string({ required_error: 'Back is required.' }).min(1, 'Back cannot be empty.').max(255),
  part_of_speech: z.string().max(50).optional(),
});

/**
 * Schema for validating the flashcard ID from the URL path.
 * Ensures that 'id' is a valid UUID.
 */
export const GetFlashcardParamsSchema = z.object({
  id: z.string().uuid({ message: 'Flashcard ID must be a valid UUID.' }),
});

/**
 * Schema for validating the update of an existing flashcard.
 * All fields are optional to allow partial updates.
 * Ensures that 'front' and 'back' are non-empty strings if provided, with maximum length of 249.
 * 'part_of_speech' can be a string with max 249 characters or null.
 */
export const UpdateFlashcardSchema = z.object({
  front: z.string().min(1, 'Front cannot be empty.').max(249, 'Front cannot exceed 249 characters.').optional(),
  back: z.string().min(1, 'Back cannot be empty.').max(249, 'Back cannot exceed 249 characters.').optional(),
  part_of_speech: z.string().max(249, 'Part of speech cannot exceed 249 characters.').nullable().optional(),
});

/**
 * Schema for validating the update profile request.
 * Only allows updating the default_ai_level field with valid language level values.
 * Represents the validation for `PATCH /api/profile`.
 */
export const updateProfileSchema = z.object({
  default_ai_level: z.enum(['a1', 'a2', 'b1', 'b2', 'c1', 'c2'], {
    required_error: 'default_ai_level is required.',
    invalid_type_error: 'default_ai_level must be a valid language level (a1, a2, b1, b2, c1, c2).',
  }),
});

const flashcardImportItemSchema = z.object({
  front: z.string().min(1, 'Front is required'),
  back: z.string().min(1, 'Back is required'),
  part_of_speech: z.string().nullable().optional(),
});

const importMetricsSchema = z.object({
  generatedCount: z.number().int().min(0),
  importedCount: z.number().int().min(1),
});

export const importFlashcardsRequestSchema = z
  .object({
    flashcards: z.array(flashcardImportItemSchema).min(1, 'At least one flashcard is required'),
    metrics: importMetricsSchema,
  })
  .refine((data) => data.flashcards.length === data.metrics.importedCount, {
    message: 'importedCount must match the number of flashcards',
    path: ['metrics', 'importedCount'],
  });

/**
 * Schema for validating the update card review request.
 * Ensures that 'flashcardId' is a valid UUID and 'knewIt' is a boolean.
 */
export const updateCardReviewSchema = z.object({
  flashcardId: z.string().uuid('Flashcard ID must be a valid UUID.'),
  knewIt: z.boolean({ required_error: 'knewIt is required.' }),
});
